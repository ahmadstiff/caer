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

    error ZeroAmount();
    error PositionUnavailable();
    error InsufficientShares();
    error InsufficientLiquidity();
    error InsufficientCollateral();
    error InsufficientToken();
    error FlashloanFailed();
    error PositionNotCreated();
    error InvalidOracle();
    error LTVExceedMaxAmount();
    error SwitchToCollateralToken();
    error TokenNotAvailable();

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

    uint256 public totalSupplyAssets;
    uint256 public totalSupplyShares;
    uint256 public totalBorrowAssets;
    uint256 public totalBorrowShares;

    mapping(address => uint256) public userSupplyShares;
    mapping(address => uint256) public userBorrowShares;
    mapping(address => uint256) public userCollaterals;
    mapping(address => address) public addressPosition;

    address public collateralToken;
    address public borrowToken;
    address public router = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address public oracle;

    uint256 public lastAccrued;

    uint256 ltv; // percentage

    modifier positionRequired() {
        if (addressPosition[msg.sender] == address(0)) {
            revert PositionNotCreated();
        }
        _;
    }

    constructor(address _collateralToken, address _borrowToken, address _oracle, uint256 _ltv) {
        collateralToken = _collateralToken;
        borrowToken = _borrowToken;
        lastAccrued = block.timestamp;

        if (_oracle == address(0)) revert InvalidOracle();
        oracle = _oracle;

        if (_ltv > 1e18) revert LTVExceedMaxAmount();
        ltv = _ltv;
    }

    function createPosition() public {
        if (addressPosition[msg.sender] == address(0)) {
            position = new Position(collateralToken, borrowToken);
            addressPosition[msg.sender] = address(position);
        }
    }

    /**
     * @dev Supply is a function to fill liquidity,
     * other user borrowing token sources from supply.
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

    function accrueInterest() public {
        _accrueInterest();
    }

    function _accrueInterest() internal {
        uint256 borrowRate = 10;

        uint256 interestPerYear = (totalBorrowAssets * borrowRate) / 100;

        uint256 elapsedTime = block.timestamp - lastAccrued;

        uint256 interest = (interestPerYear * elapsedTime) / 365 days;

        totalSupplyAssets += interest;
        totalBorrowAssets += interest;
        lastAccrued = block.timestamp;
    }

    function supplyCollateralByPosition(uint256 amount) public positionRequired nonReentrant {
        if (amount == 0) revert ZeroAmount();
        accrueInterest();
        userCollaterals[msg.sender] += amount;
        IERC20(collateralToken).safeTransferFrom(msg.sender, address(this), amount);

        emit SupplyCollateralByPosition(msg.sender, amount);
    }

    function withdrawCollateral(uint256 amount) public nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (amount > userCollaterals[msg.sender]) revert InsufficientCollateral();

        _accrueInterest();

        userCollaterals[msg.sender] -= amount;

        _isHealthy(msg.sender);

        IERC20(collateralToken).safeTransfer(msg.sender, amount);

        emit WithdrawCollateral(msg.sender, amount);
    }

    function _isHealthy(address user) internal view {
        /**
         * @dev if user has position, swap token will be including to collateral value,
         */
        uint256 positionValue = 0;
        if (addressPosition[msg.sender] != address(0)) {
            uint256 positionLength = IPosition(addressPosition[msg.sender]).getTokenOwnerLength();
            for (uint256 i = 0; i < positionLength; i++) {
                address tokenAddress = IPosition(addressPosition[msg.sender]).getTokenOwnerAddress(i);
                if (tokenAddress != address(0)) {
                    uint256 positionPrice = IOracle(oracle).getPrice(tokenAddress, borrowToken);
                    uint256 positionDecimal = IOracle(oracle).getQuoteDecimal(tokenAddress);
                    positionValue += (
                        IPosition(addressPosition[msg.sender]).getTokenOwnerBalances(tokenAddress) * positionPrice
                    ) / positionDecimal;
                }
            }
        }

        uint256 collateralPrice = IOracle(oracle).getPrice(collateralToken, borrowToken);
        uint256 collateralDecimals = 10 ** IERC20Metadata(collateralToken).decimals();

        uint256 borrowed =
            userBorrowShares[user] != 0 ? (userBorrowShares[user] * totalBorrowAssets) / totalBorrowShares : 0;

        uint256 collateralValue = (userCollaterals[user] * collateralPrice) / collateralDecimals;
        uint256 maxBorrow = ((collateralValue + positionValue) * ltv) / 1e18;

        if (borrowed > maxBorrow) revert InsufficientCollateral();
    }

    function borrowByPosition(uint256 amount) public positionRequired nonReentrant {
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
        _isHealthy(msg.sender);
        if (totalBorrowAssets > totalSupplyAssets) {
            revert InsufficientLiquidity();
        }
        IERC20(borrowToken).safeTransfer(msg.sender, amount);

        emit BorrowByPosition(msg.sender, amount, shares);
    }

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

    function repayWithSelectedToken(uint256 shares, address _token) public nonReentrant {
        if (shares == 0) revert ZeroAmount();
        _accrueInterest();
        uint256 amountOut;
        uint256 borrowAmount = ((shares * totalBorrowAssets) / totalBorrowShares);
        //_token = weth
        if (_token == collateralToken) {
            amountOut = tokenCalculator(userCollaterals[msg.sender], collateralToken, borrowToken);
            userCollaterals[msg.sender] = 0;
        } else if (getTokenCounterByPosition(_token) == 0) {
            revert TokenNotAvailable();
        } else {
            amountOut = tokenCalculator(getTokenBalancesByPosition(_token), _token, borrowToken);
        }

        userBorrowShares[msg.sender] -= shares;
        totalBorrowShares -= shares;
        totalBorrowAssets -= borrowAmount;
        amountOut -= borrowAmount; // _token - borrowAmount
        // }

        /**
         * @dev
         * After pay, borrowToken back to collateralToken
         */
        if (_token == collateralToken) {
            amountOut = tokenCalculator(amountOut, borrowToken, collateralToken);
            userCollaterals[msg.sender] += amountOut;
        } else {
            amountOut = tokenCalculator(amountOut, borrowToken, _token);
            IPosition(addressPosition[msg.sender]).costSwapToken(_token, borrowAmount);
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

    function swapTokenByPosition(address _tokenTo, address _tokenFrom, uint256 amountIn)
        public
        positionRequired
        returns (uint256 amountOut)
    {
        if (amountIn == 0) revert ZeroAmount();
        if (_tokenFrom != collateralToken && getTokenCounterByPosition(_tokenFrom) == 0) revert TokenNotAvailable();

        if (_tokenFrom == collateralToken) {
            IERC20(_tokenFrom).approve(address(this), amountIn);
            IERC20(_tokenFrom).safeTransferFrom(address(this), _tokenFrom, amountIn);
            userCollaterals[msg.sender] -= amountIn;
        } else {
            uint256 balances = getTokenBalancesByPosition(_tokenFrom);
            if (balances < amountIn) {
                revert InsufficientToken();
            } else if (_tokenFrom == borrowToken) {
                amountOut = tokenCalculator(amountIn, _tokenFrom, _tokenTo);
            } else {
                IPosition(addressPosition[msg.sender]).costSwapToken(_tokenFrom, amountIn);
            }
        }

        amountOut = tokenCalculator(amountIn, _tokenFrom, _tokenTo);

        if (_tokenTo == collateralToken) {
            // mint token usdc, sejumlah usdc, dikirim ke lendingPool
            TokenSwap(_tokenTo).mint(address(this), amountOut);
        } else {
            // mint token usdc, sejumlah usdc, dikirim ke position
            TokenSwap(_tokenTo).mint(addressPosition[msg.sender], amountOut);
        }

        if (_tokenTo == collateralToken) {
            userCollaterals[msg.sender] += amountOut;
        } else {
            IPosition(addressPosition[msg.sender]).swapToken(_tokenTo, amountOut);
        }

        emit SwapByPosition(msg.sender, collateralToken, _tokenTo, amountIn, amountOut);
    }

    function tokenCalculator(uint256 _amount, address _tokenFrom, address _tokenTo) public view returns (uint256) {
        (uint256 _realPrice,) = IOracle(oracle).getPriceTrade(_tokenTo, _tokenFrom);
        uint256 amountOut = _amount * IOracle(oracle).getQuoteDecimal(_tokenTo) / _realPrice;
        return amountOut;
    }

    function getAllTokenOwnerAddress() public view positionRequired returns (address[] memory) {
        return IPosition(addressPosition[msg.sender]).getAllTokenOwnerAddress();
    }

    function getTokenLengthByPosition() public view positionRequired returns (uint256) {
        return IPosition(addressPosition[msg.sender]).getTokenOwnerLength();
    }

    function getTokenAddressByPosition(uint256 _index) public view positionRequired returns (address) {
        return IPosition(addressPosition[msg.sender]).getTokenOwnerAddress(_index);
    }

    function getTokenCounterByPosition(address _token) public view positionRequired returns (uint256) {
        return IPosition(addressPosition[msg.sender]).getTokenCounter(_token);
    }

    function getTokenBalancesByPosition(address _token) public view positionRequired returns (uint256) {
        return IPosition(addressPosition[msg.sender]).getTokenOwnerBalances(_token);
    }

    function getTokenDecimalByPosition(uint256 _index) public view positionRequired returns (uint256) {
        return IERC20Metadata(Position(addressPosition[msg.sender]).getTokenOwnerAddress(_index)).decimals();
    }
}
