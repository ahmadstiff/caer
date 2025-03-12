// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import {LendingPool} from "./LendingPool.sol";

contract Position {
    error TokenNotFound();
    error InsufficientBalance();

    address public collateralAssets;
    address public borrowAssets;
    address public owner;

    uint256 public counter;

    mapping(uint256 => address) public tokenLists;
    mapping(address => uint256) public tokenListsId;
    mapping(address => uint256) public tokenBalances;

    event Liquidate(address user);
    event SwapToken(address user, address token, uint256 amount);

    constructor(address _collateral, address _borrow) {
        collateralAssets = _collateral;
        borrowAssets = _borrow;
        owner = msg.sender;
    }

    function liquidate() public {
        emit Liquidate(owner);
    }

    function swapToken(address _token, uint256 _amount) public {
        if (tokenListsId[_token] == 0) {
            ++counter;
            tokenLists[counter] = _token;
            tokenListsId[_token] = counter;
        }
        tokenBalances[_token] += _amount;
        emit SwapToken(msg.sender, _token, _amount);
    }

    function costSwapToken(address _token, uint256 _amount) public {
        if (tokenListsId[_token] == 0) revert TokenNotFound();
        // if (tokenBalances[_token] > _amount) revert InsufficientBalance();
        // if (tokenBalances[_token] == _amount) tokenBalances[_token] = 0;
        // else 
        tokenBalances[_token] -= _amount;
        // IERC20(_token).approve(address(this), _amount);
        // IERC20(_token).transferFrom(address(this), _token, _amount);
        emit SwapToken(msg.sender, _token, _amount);
    }

    function getTokenOwnerLength() public view returns (uint256) {
        return counter;
    }

    function getTokenOwnerAddress(uint256 _counter) public view returns (address) {
        return tokenLists[_counter];
    }

    function getTokenOwnerBalances(address _token) public view returns (uint256) {
        return tokenBalances[_token];
    }

    function getTokenCounter(address _token) public view returns (uint256) {
        return tokenListsId[_token];
    }

    function getAllTokenOwnerAddress() public view returns (address[] memory) {
        address[] memory records = new address[](counter);
        for (uint256 i = 0; i < counter; i++) {
            records[i] = tokenLists[i + 1];
        }
        return records;
    }
}
