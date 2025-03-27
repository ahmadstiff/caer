import React, { useState } from 'react';
import { TokenInput } from './TokenInput';

export default function LimitPanel() {
    const [fromToken, setFromToken] = useState({
        symbol: 'ETH',
        amount: '',
    });
    const [toToken, setToToken] = useState({
        symbol: 'USDT',
        amount: '',
    });
    const [limitPrice, setLimitPrice] = useState('');

    const handlePlaceOrder = () => {
        // Implementasi logika limit order
        console.log('Placing limit order:', { fromToken, toToken, limitPrice });
    };

    return (
        <div className="space-y-4">
            <TokenInput
                label="From"
                value={fromToken}
                onChange={setFromToken}
            />

            <div className="space-y-2">
                <label className="text-sm text-gray-400">Limit Price</label>
                <input
                    type="number"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="w-full bg-gray-700 rounded-xl p-3 text-white"
                    placeholder="Enter price"
                />
            </div>

            <TokenInput
                label="To"
                value={toToken}
                onChange={setToToken}
            />

            <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl"
                onClick={handlePlaceOrder}
            >
                Place Limit Order
            </button>
        </div>
    );
} 