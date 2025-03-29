'use client';

import React, { useState, useEffect } from 'react';
import { ArrowDownIcon } from '@heroicons/react/24/outline';
import { TOKEN_OPTIONS, TokenOption } from '@/constants/tokenOption';
import { useAccount } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { Address } from 'viem';
import Image from 'next/image';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useSwapToken } from '@/hooks/useSwapToken';
import { useTokenPrice } from '@/hooks/useTokenPrice';

export default function SwapPanel() {
    const { address } = useAccount();
    const [fromToken, setFromToken] = useState<TokenOption>(TOKEN_OPTIONS[0]);
    const [toToken, setToToken] = useState<TokenOption>(TOKEN_OPTIONS[1]);
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [slippage, setSlippage] = useState('0.5');
    const [isMounted, setIsMounted] = useState(false);

    // Use our custom hooks
    const { balance: fromTokenBalance } = useTokenBalance(fromToken.address as Address, fromToken.decimals);
    const { balance: toTokenBalance } = useTokenBalance(toToken.address as Address, toToken.decimals);
    const { price } = useTokenPrice(fromToken.address as Address, toToken.address as Address);
    const { swapToken, isLoading, error, setError } = useSwapToken();

    // Set mounted state to true after hydration
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Calculate exchange rate and to amount
    useEffect(() => {
        if (fromAmount && price) {
            try {
                const amount = parseFloat(fromAmount);
                if (!isNaN(amount) && amount > 0) {
                    const calculatedAmount = amount * price;
                    setToAmount(calculatedAmount.toFixed(6));
                } else {
                    setToAmount('');
                }
            } catch (err) {
                console.error('Error calculating exchange rate:', err);
                setToAmount('');
            }
        } else {
            setToAmount('');
        }
    }, [fromAmount, price, fromToken, toToken]);

    // Swap positions of tokens
    const switchTokens = () => {
        setFromToken(toToken);
        setToToken(fromToken);
        setFromAmount(toAmount);
        setToAmount(fromAmount);
    };

    // Handle token swap
    const handleSwap = async () => {
        if (!address) {
            setError('Please connect your wallet');
            return;
        }

        if (!fromAmount || parseFloat(fromAmount) <= 0) {
            setError('Please enter a valid amount');
            return;
        }

        if (parseFloat(fromAmount) > parseFloat(fromTokenBalance)) {
            setError('Insufficient balance');
            return;
        }

        await swapToken({
            fromToken: {
                address: fromToken.address,
                name: fromToken.name,
                decimals: fromToken.decimals
            },
            toToken: {
                address: toToken.address,
                name: toToken.name
            },
            fromAmount,
            toAmount,
            onSuccess: () => {
                // Reset form after successful swap
                setFromAmount('');
                setToAmount('');
            }
        });
    };

    // Determine button text based on client-side state only
    const getButtonText = () => {
        if (!isMounted) return 'Swap'; // Default text for SSR
        if (!address) return 'Connect Wallet';
        if (isLoading) return 'Processing...';
        return 'Swap';
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Swap Token</h2>

            {/* From Token */}
            <div className="bg-gray-700 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                    <label className="text-gray-400">From</label>
                    <span className="text-gray-400">
                        Balance: {fromTokenBalance} {fromToken.name}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="number"
                        className="flex-1 bg-transparent text-white text-xl focus:outline-none"
                        placeholder="0.0"
                        value={fromAmount}
                        onChange={(e) => setFromAmount(e.target.value)}
                        aria-label="Amount to swap"
                    />
                    <select
                        className="bg-gray-600 text-white py-2 px-3 rounded-lg"
                        value={fromToken.address}
                        onChange={(e) => setFromToken(TOKEN_OPTIONS.find(t => t.address === e.target.value) || TOKEN_OPTIONS[0])}
                        aria-label="Select token to swap from"
                    >
                        {TOKEN_OPTIONS.map((token) => (
                            <option key={token.address} value={token.address}>
                                {token.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Switch button */}
            <div className="flex justify-center">
                <button
                    onClick={switchTokens}
                    className="bg-gray-700 p-2 rounded-full hover:bg-gray-600 transition"
                    aria-label="Switch tokens"
                >
                    <ArrowDownIcon className="h-5 w-5 text-blue-400" />
                </button>
            </div>

            {/* To Token */}
            <div className="bg-gray-700 rounded-xl p-4">
                <div className="flex justify-between mb-2">
                    <label className="text-gray-400">To</label>
                    <span className="text-gray-400">
                        Balance: {toTokenBalance} {toToken.name}
                    </span>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="number"
                        className="flex-1 bg-transparent text-white text-xl focus:outline-none"
                        placeholder="0.0"
                        value={toAmount}
                        readOnly
                        aria-label="Amount to receive"
                    />
                    <select
                        className="bg-gray-600 text-white py-2 px-3 rounded-lg"
                        value={toToken.address}
                        onChange={(e) => setToToken(TOKEN_OPTIONS.find(t => t.address === e.target.value) || TOKEN_OPTIONS[1])}
                        aria-label="Select token to receive"
                    >
                        {TOKEN_OPTIONS.map((token) => (
                            <option key={token.address} value={token.address}>
                                {token.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Swap Rate */}
            <div className="bg-gray-700 rounded-xl p-3 text-sm text-gray-400">
                <div className="flex justify-between">
                    <span>Exchange Rate:</span>
                    <span>
                        {price
                            ? `1 ${fromToken.name} ≈ ${price.toFixed(6)} ${toToken.name}`
                            : 'Loading...'
                        }
                    </span>
                </div>
            </div>

            {/* Slippage Setting */}
            <div className="bg-gray-700 rounded-xl p-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Slippage Tolerance</span>
                    <div className="flex space-x-2">
                        {['0.5', '1', '2', '3'].map((value) => (
                            <button
                                key={value}
                                className={`px-2 py-1 rounded text-sm ${slippage === value
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-600 text-gray-300'
                                    }`}
                                onClick={() => setSlippage(value)}
                            >
                                {value}%
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-red-500 text-sm bg-red-900/30 p-2 rounded">
                    {error}
                </div>
            )}

            {/* Swap Button */}
            <button
                onClick={handleSwap}
                disabled={isLoading || !fromAmount || !toAmount || !address}
                className={`w-full py-3 rounded-xl font-bold ${isLoading || !fromAmount || !toAmount || !address
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
            >
                {getButtonText()}
            </button>
        </div>
    );
} 