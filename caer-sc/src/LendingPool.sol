// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {IERC20Metadata} from "openzeppelin-contracts/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import {SafeERC20} from "openzeppelin-contracts/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {Position} from "./Position.sol";

interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(ExactInputSingleParams calldata params) external payable returns (uint256 amountOut);
}

interface IOracle {
    function getPrice(address _collateral, address _borrow) external view returns (uint256);
    function getPriceTrade(address _tokenFrom, address _tokenTo) external view returns (uint256, uint256);
    function getQuoteDecimal(address _token) external view returns (uint256);
    function priceCollateral(address _token) external view returns (uint256);
}

interface TokenSwap {
    function mint(address _to, uint256 _amount) external;
}

interface IPosition {
    function getTokenOwnerLength() external view returns (uint256);
    function getTokenOwnerBalances(address _token) external view returns (uint256);
    function getTokenCounter(address _token) external view returns (uint256);
    function getTokenOwnerAddress(uint256 _counter) external view returns (address);
    function getAllTokenOwnerAddress() external view returns (address[] memory);
    function counter() external view returns (uint256);
    function swapToken(address _token, uint256 _amount) external;
    function costSwapToken(address _token, uint256 _amount) external;
}

contract LendingPool is ReentrancyGuard {
    using SafeERC20 for IERC20; // fungsi dari IERC20 akan ketambahan SafeERC20

    error FlashloanFailed();
    error InsufficientCollateral();
    error InsufficientLiquidity();
    error InsufficientShares();
    error InsufficientToken();
    error InvalidOracle();
    error LTVExceedMaxAmount();
    error PositionNotCreated();
    error PositionUnavailable();
    error ProhibitedToBuy();
    error SwitchToCollateralToken();
    error TokenNotAvailable();
    error TradingAccountListed();
    error ZeroAmount();

    event CreatePosition(address user, address positionAddress);
    event Supply(address user, uint256 amount, uint256 shares);
    event Withdraw(address user, uint256 amount, uint256 shares);
    event SupplyCollateralByPosition(address user, uint256 amount);
    event WithdrawCollateral(address user, uint256 amount);
    event BorrowByPosition(address user, uint256 amount, uint256 shares);
    event RepayByPosition(address user, uint256 amount, uint256 shares);
    event RepayWithCollateralByPosition(address user, uint256 amount, uint256 shares);
    event Flashloan(address user, address token, uint256 amount);
    event SwapByPosition(address user, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

    Position public position;

    struct TokenizedTradingPosition {
        uint256 id;
        string name;
        address addressPosition;
        address owner;
    }

    struct ListingDetails {
        address addressPosition;
        address tokenForPay;
        uint256 price;
    }

    uint256 public totalSupplyAssets;
    uint256 public totalSupplyShares;
    uint256 public totalBorrowAssets;
    uint256 public totalBorrowShares;
    uint256 public counter;

    mapping(address => uint256) public userSupplyShares;
    mapping(address => uint256) public userBorrowShares;
    mapping(address => uint256) public userCollaterals;
    mapping(address => address[]) public addressPositions;
    mapping(uint256 => address) public addressPositionOwners;
    mapping(uint256 => address) public addressPositionDetails;
    mapping(address => uint256) public addressArrayLocation;
    mapping(uint256 => ListingDetails) public tradingAccountListing;

    address public collateralToken;
    address public borrowToken;
    address public router = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address public oracle;

    uint256 public lastAccrued;

    uint256 ltv;

    modifier positionRequired() {
        if (addressPositions[msg.sender].length == 0) {
            revert PositionNotCreated();
        }
        _;
    }

    /**
     * @dev Contract constructor to initialize the lending and borrowing system.
     *
     * - Sets the collateral and borrow token addresses.
     * - Initializes `lastAccrued` with the current block timestamp for interest calculations.
     * - Validates that the provided oracle address is not zero; otherwise, reverts with `InvalidOracle()`.
     * - Sets the oracle contract address for price fetching.
     * - Ensures the Loan-to-Value (LTV) ratio does not exceed the maximum limit of `1e18`; otherwise, reverts with `LTVExceedMaxAmount()`.
     * - Stores the validated LTV value.
     *
     * @param _collateralToken The address of the token used as collateral.
     * @param _borrowToken The address of the token that can be borrowed.
     * @param _oracle The address of the price oracle contract.
     * @param _ltv The Loan-to-Value ratio (must not exceed `1e18`).
     */
    constructor(address _collateralToken, address _borrowToken, address _oracle, uint256 _ltv) {
        collateralToken = _collateralToken;
        borrowToken = _borrowToken;
        lastAccrued = block.timestamp;

        if (_oracle == address(0)) revert InvalidOracle();
        oracle = _oracle;

        if (_ltv > 1e18) revert LTVExceedMaxAmount();
        ltv = _ltv;
    }

    /**
     * @dev Creates a new tokenized trading position.
     *
     * - Increments the position counter to track unique positions.
     * - Deploys a new `Position` contract instance using the specified collateral and borrow tokens.
     * - Stores the newly created position details in mappings for tracking.
     * - Associates the position with the sender's address.
     *
     */
    function createPosition() public {
        counter++;
        position = new Position(collateralToken, borrowToken);
        addressPositions[msg.sender].push(address(position));
        addressPositionOwners[counter] = msg.sender;
        addressPositionDetails[counter] = address(position);
        addressArrayLocation[address(position)] = addressPositions[msg.sender].length - 1;
    }

    /**
     * @dev Allows users to supply liquidity to the protocol.
     * The supplied tokens increase the total available assets,
     * which other users can borrow.
     *
     * - The function prevents zero-amount supply.
     * - It accrues interest before processing new deposits.
     * - If it's the first deposit, the shares are equal to the amount supplied.
     * - Otherwise, it calculates shares proportionally based on total supply.
     * - Updates the user's share balance and the protocol's total supply.
     * - Transfers the tokens from the user to the contract securely.
     * - Emits a `Supply` event with details of the deposit.
     *
     * @param amount The amount of tokens to supply.
     */
    function supply(uint256 amount) public nonReentrant {
        if (amount == 0) revert ZeroAmount();
        _accrueInterest();
        uint256 shares = 0;
        if (totalSupplyAssets == 0) {
            shares = amount;
        } else {
            shares = (amount * totalSupplyShares) / totalSupplyAssets;
        }

        userSupplyShares[msg.sender] += shares;
        totalSupplyShares += shares;
        totalSupplyAssets += amount;

        IERC20(borrowToken).safeTransferFrom(msg.sender, address(this), amount);

        emit Supply(msg.sender, amount, shares);
    }

    /**
     * @dev Allows users to withdraw their supplied liquidity by redeeming shares.
     * The function calculates the corresponding asset amount based on the
     * proportion of total shares.
     *
     * - Prevents zero-amount withdrawals.
     * - Ensures the user has enough shares to withdraw.
     * - Accrues interest before processing the withdrawal.
     * - Calculates the amount of tokens the user receives based on their shares.
     * - Updates the user's share balance and the protocol's total supply.
     * - Ensures the protocol maintains sufficient liquidity for outstanding borrows.
     * - Transfers the tokens securely to the user.
     * - Emits a `Withdraw` event with details of the transaction.
     *
     * @param shares The number of supply shares the user wants to withdraw.
     */
    function withdraw(uint256 shares) external nonReentrant {
        if (shares == 0) revert ZeroAmount();
        if (shares > userSupplyShares[msg.sender]) revert InsufficientShares();

        _accrueInterest();

        uint256 amount = ((shares * totalSupplyAssets) / totalSupplyShares);

        userSupplyShares[msg.sender] -= shares;
        totalSupplyShares -= shares;
        totalSupplyAssets -= amount;

        if (totalSupplyAssets < totalBorrowAssets) {
            revert InsufficientLiquidity();
        }

        IERC20(borrowToken).safeTransfer(msg.sender, amount);

        emit Withdraw(msg.sender, amount, shares);
    }

    /**
     * @dev Public function to accrue interest on borrowed assets.
     * Calls the internal `_accrueInterest` function to update interest calculations.
     */
    function accrueInterest() public {
        _accrueInterest();
    }

    /**
     * @dev Internal function to calculate and apply accrued interest to the protocol.
     *
     * - Uses a fixed borrow rate of 10% per year.
     * - Computes the yearly interest based on total borrowed assets.
     * - Determines elapsed time since the last accrual.
     * - Calculates the proportional interest for the elapsed time.
     * - Increases both total supply and total borrowed assets by the interest amount.
     * - Updates the last accrued timestamp.
     */
    function _accrueInterest() internal {
        uint256 borrowRate = 10;

        uint256 interestPerYear = (totalBorrowAssets * borrowRate) / 100;

        uint256 elapsedTime = block.timestamp - lastAccrued;

        uint256 interest = (interestPerYear * elapsedTime) / 365 days;

        totalSupplyAssets += interest;
        totalBorrowAssets += interest;
        lastAccrued = block.timestamp;
    }

    /**
     * @dev Allows users to supply collateral for their position.
     *
     * - Prevents zero-amount collateral deposits.
     * - Accrues interest before processing the deposit to ensure up-to-date calculations.
     * - Increases the user's collateral balance.
     * - Transfers the specified collateral amount securely from the user to the contract.
     * - Emits a `SupplyCollateralByPosition` event to log the deposit.
     *
     * @param amount The amount of collateral tokens to supply.
     */
    function supplyCollateralByPosition(uint256 amount) public nonReentrant {
        if (amount == 0) revert ZeroAmount();
        accrueInterest();
        userCollaterals[msg.sender] += amount;
        IERC20(collateralToken).safeTransferFrom(msg.sender, address(this), amount);

        emit SupplyCollateralByPosition(msg.sender, amount);
    }

    /**
     * @dev Allows users to withdraw their supplied collateral.
     *
     * - Prevents zero-amount withdrawals.
     * - Ensures the user has enough collateral to withdraw the requested amount.
     * - Accrues interest before processing the withdrawal to keep calculations updated.
     * - Reduces the user's collateral balance accordingly.
     * - Calls `_isHealthy` to verify the user's position remains solvent after withdrawal.
     * - Transfers the specified collateral amount securely to the user.
     * - Emits a `WithdrawCollateral` event to log the transaction.
     *
     * @param amount The amount of collateral tokens to withdraw.
     */
    function withdrawCollateral(uint256 amount) public nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (amount > userCollaterals[msg.sender]) revert InsufficientCollateral();

        _accrueInterest();

        userCollaterals[msg.sender] -= amount;

        IERC20(collateralToken).safeTransfer(msg.sender, amount);

        emit WithdrawCollateral(msg.sender, amount);
    }

    /**
     * @dev Allows users to borrow assets using their supplied collateral.
     *
     * - Accrues interest before processing the borrow request.
     * - Calculates the borrow shares based on the existing borrow-to-share ratio.
     * - If this is the first borrow, the shares are equal to the borrowed amount.
     * - Updates the user's borrow share balance and the protocol's total borrow shares.
     * - Ensures the user's position remains healthy after borrowing.
     * - Prevents borrowing if total borrowed assets exceed total supplied assets.
     * - Transfers the borrowed tokens securely to the user.
     * - Emits a `BorrowByPosition` event to log the transaction.
     *
     * @param amount The amount of tokens the user wants to borrow.
     */
    function borrowByPosition(uint256 amount) public nonReentrant {
        _accrueInterest();
        uint256 shares = 0;
        if (totalBorrowShares == 0) {
            shares = amount;
        } else {
            shares = ((amount * totalBorrowShares) / totalBorrowAssets);
        }

        userBorrowShares[msg.sender] += shares;
        totalBorrowShares += shares;
        totalBorrowAssets += amount;
        
        if (totalBorrowAssets > totalSupplyAssets) {
            revert InsufficientLiquidity();
        }
        IERC20(borrowToken).safeTransfer(msg.sender, amount);

        emit BorrowByPosition(msg.sender, amount, shares);
    }

    /**
     * @dev Allows users to repay their borrowed assets using their position.
     *
     * - Prevents zero-amount repayments.
     * - Accrues interest before processing the repayment to ensure accurate calculations.
     * - Determines the corresponding borrow amount based on the user's borrow shares.
     * - Reduces the user's borrow shares and updates the protocol's total borrowed assets.
     * - Transfers the repayment amount securely from the user to the contract.
     * - Emits a `RepayByPosition` event to log the transaction.
     *
     * @param shares The number of borrow shares the user wants to repay.
     */
    function repayByPosition(uint256 shares) public positionRequired nonReentrant {
        if (shares == 0) revert ZeroAmount();

        _accrueInterest();

        uint256 borrowAmount = ((shares * totalBorrowAssets) / totalBorrowShares);
        userBorrowShares[msg.sender] -= shares;
        totalBorrowShares -= shares;
        totalBorrowAssets -= borrowAmount;

        IERC20(borrowToken).safeTransferFrom(msg.sender, address(this), borrowAmount);

        emit RepayByPosition(msg.sender, borrowAmount, shares);
    }

    /**
     * @dev Allows users to repay their borrowed assets using a selected token from their position.
     *
     * - Prevents zero-amount repayments.
     * - Ensures the specified position is valid before proceeding.
     * - Accrues interest before processing the repayment.
     * - Determines the equivalent amount of the selected token required to cover the borrow amount.
     * - Supports repayment using either the collateral token or another token from the user's position.
     * - Updates the user's borrow shares and total borrowed assets.
     * - Converts any excess token amount back to the appropriate collateral or position token.
     * - Calls `costSwapToken` on the position contract to handle token swaps if a non-collateral token is used.
     * - Emits a `RepayWithCollateralByPosition` event to log the transaction.
     *
     * @param shares The number of borrow shares the user wants to repay.
     * @param _token The address of the token the user wants to use for repayment.
     * @param _positionIndex The index of the user's position from which the token will be used.
     */
    function repayWithSelectedToken(uint256 shares, address _token, uint256 _positionIndex) public nonReentrant {
        if (shares == 0) revert ZeroAmount();
        if (addressPositions[msg.sender][_positionIndex] == address(0)) revert PositionUnavailable();

        _accrueInterest();
        uint256 amountOut;
        uint256 borrowAmount = ((shares * totalBorrowAssets) / totalBorrowShares);
        if (_token == collateralToken) {
            amountOut = tokenCalculator(userCollaterals[msg.sender], collateralToken, borrowToken);
            userCollaterals[msg.sender] = 0;
        } else if (getTokenCounterByPosition(_token, _positionIndex) == 0) {
            revert TokenNotAvailable();
        } else {
            amountOut = tokenCalculator(getTokenBalancesByPosition(_token, _positionIndex), _token, borrowToken);
        }

        userBorrowShares[msg.sender] -= shares;
        totalBorrowShares -= shares;
        totalBorrowAssets -= borrowAmount;
        amountOut -= borrowAmount;

        /**
         * @dev After repayment, converts any excess borrowToken back to the original token type.
         */
        if (_token == collateralToken) {
            amountOut = tokenCalculator(amountOut, borrowToken, collateralToken);
            userCollaterals[msg.sender] += amountOut;
        } else {
            amountOut = tokenCalculator(amountOut, borrowToken, _token);
            IPosition(addressPositions[msg.sender][_positionIndex]).costSwapToken(_token, borrowAmount);
        }
        emit RepayWithCollateralByPosition(msg.sender, borrowAmount, shares);
    }

    function FlashLoan(address token, uint256 amount, bytes calldata data) external {
        if (amount == 0) revert ZeroAmount();

        IERC20(token).safeTransfer(msg.sender, amount);

        (bool success,) = address(msg.sender).call(data);
        if (!success) revert FlashloanFailed();

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        emit Flashloan(msg.sender, token, amount);
    }

    /**
     * @dev Swaps one token for another within a user's position.
     *
     * - Ensures the input amount is greater than zero.
     * - Checks that the specified position is valid.
     * - Validates whether the token being swapped from is available in the position.
     * - Handles swaps from collateral and non-collateral tokens differently:
     *     - If swapping from collateral, transfers the token from the lending pool.
     *     - If swapping from a non-collateral token, verifies token balances and performs necessary conversions.
     * - Calls `costSwapToken` on the position contract if a position token swap is needed.
     * - Calculates the output token amount using `tokenCalculator`.
     * - Mints the swapped token:
     *     - If swapped into collateral, the minted amount is sent to the lending pool.
     *     - Otherwise, the minted token is sent to the user's position.
     * - Updates the user's collateral balance if the output token is the collateral token.
     * - Calls `swapToken` on the position contract to finalize the swap if applicable.
     * - Emits a `SwapByPosition` event to log the transaction.
     *
     * @param _tokenTo The address of the token the user wants to receive.
     * @param _tokenFrom The address of the token the user is swapping.
     * @param amountIn The amount of `_tokenFrom` the user wants to swap.
     * @param _positionIndex The index of the user's position from which the token will be swapped.
     * @return amountOut The amount of `_tokenTo` received from the swap.
     */
    function swapTokenByPosition(address _tokenTo, address _tokenFrom, uint256 amountIn, uint256 _positionIndex)
        public
        positionRequired
        returns (uint256 amountOut)
    {
        if (amountIn == 0) revert ZeroAmount();
        if (addressPositions[msg.sender][_positionIndex] == address(0)) revert PositionUnavailable();
        if (_tokenFrom != collateralToken && getTokenCounterByPosition(_tokenFrom, _positionIndex) == 0) {
            revert TokenNotAvailable();
        }

        if (_tokenFrom == collateralToken) {
            IERC20(_tokenFrom).approve(address(this), amountIn);
            IERC20(_tokenFrom).safeTransferFrom(address(this), _tokenFrom, amountIn);
            userCollaterals[msg.sender] -= amountIn;
        } else {
            uint256 balances = getTokenBalancesByPosition(_tokenFrom, _positionIndex);
            if (balances < amountIn) {
                revert InsufficientToken();
            } else if (_tokenFrom == borrowToken) {
                amountOut = tokenCalculator(amountIn, _tokenFrom, _tokenTo);
            } else {
                IPosition(addressPositions[msg.sender][_positionIndex]).costSwapToken(
                    _tokenFrom, amountIn
                );
            }
        }

        amountOut = tokenCalculator(amountIn, _tokenFrom, _tokenTo);

        if (_tokenTo == collateralToken) {
            // Mint collateral token and send it to the lending pool.
            TokenSwap(_tokenTo).mint(address(this), amountOut);
        } else {
            // Mint token and send it to the user's position.
            TokenSwap(_tokenTo).mint(addressPositions[msg.sender][_positionIndex], amountOut);
        }

        if (_tokenTo == collateralToken) {
            userCollaterals[msg.sender] += amountOut;
        } else {
            IPosition(addressPositions[msg.sender][_positionIndex]).swapToken(_tokenTo, amountOut);
        }

        emit SwapByPosition(msg.sender, collateralToken, _tokenTo, amountIn, amountOut);
    }

    /**
     * @dev Calculates the output amount when swapping between two tokens.
     *
     * - Uses an external oracle to get the real-time price of the `_tokenTo` relative to `_tokenFrom`.
     * - Retrieves the quote decimal of `_tokenTo` for accurate conversion.
     * - Computes the output amount based on the provided `_amount` and exchange rate.
     * - The function is `view`, meaning it does not modify state but provides a calculated value.
     *
     * @param _amount The amount of `_tokenFrom` being exchanged.
     * @param _tokenFrom The address of the token being swapped from.
     * @param _tokenTo The address of the token being swapped to.
     * @return amountOut The calculated amount of `_tokenTo` that will be received.
     */
    function tokenCalculator(uint256 _amount, address _tokenFrom, address _tokenTo) public view returns (uint256) {
        (uint256 _realPrice,) = IOracle(oracle).getPriceTrade(_tokenTo, _tokenFrom);
        uint256 amountOut = _amount * IOracle(oracle).getQuoteDecimal(_tokenTo) / _realPrice;
        return amountOut;
    }

    function getAllTokenOwnerAddress(uint256 _positionIndex) public view positionRequired returns (address[] memory) {
        return IPosition(addressPositions[msg.sender][_positionIndex]).getAllTokenOwnerAddress();
    }

    function getTokenLengthByPosition(uint256 _positionIndex) public view positionRequired returns (uint256) {
        return IPosition(addressPositions[msg.sender][_positionIndex]).getTokenOwnerLength();
    }

    function getTokenAddressByPosition(uint256 _index, uint256 _positionIndex)
        public
        view
        positionRequired
        returns (address)
    {
        return IPosition(addressPositions[msg.sender][_positionIndex]).getTokenOwnerAddress(_index);
    }

    function getTokenCounterByPosition(address _token, uint256 _positionIndex)
        public
        view
        positionRequired
        returns (uint256)
    {
        return IPosition(addressPositions[msg.sender][_positionIndex]).getTokenCounter(_token);
    }

    function getTokenBalancesByPosition(address _token, uint256 _positionIndex)
        public
        view
        positionRequired
        returns (uint256)
    {
        return IPosition(addressPositions[msg.sender][_positionIndex]).getTokenOwnerBalances(_token);
    }

    function getTokenDecimalByPosition(uint256 _index, uint256 _positionIndex)
        public
        view
        positionRequired
        returns (uint256)
    {
        return IERC20Metadata(
            Position(addressPositions[msg.sender][_positionIndex]).getTokenOwnerAddress(_index)
        ).decimals();
    }
}
