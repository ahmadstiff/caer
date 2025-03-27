import React, { useState } from 'react';
import { TokenInput } from './TokenInput';
import { SwapSettings } from './SwapSettings';

export default function SwapPanel() {
    const [fromToken, setFromToken] = useState({
        symbol: 'ETH',
        amount: '',
    });
    const [toToken, setToToken] = useState({
        symbol: 'USDT',
        amount: '',
    });
    const [slippage, setSlippage] = useState(0.5);

    const handleSwap = () => {
        // Implementasi logika swap
        console.log('Swapping tokens:', fromToken, toToken);
    };

    return (
        <div className="space-y-4">
            <TokenInput
                label="From"
                value={fromToken}
                onChange={setFromToken}
            />

            <button
                className="w-full flex justify-center"
                onClick={() => {
                    setFromToken({ ...toToken });
                    setToToken({ ...fromToken });
                }}
            >
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
            </button>

            <TokenInput
                label="To"
                value={toToken}
                onChange={setToToken}
            />

            <SwapSettings
                slippage={slippage}
                onSlippageChange={setSlippage}
            />

            <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl"
                onClick={handleSwap}
            >
                Swap
            </button>
        </div>
    );
} 