import React from 'react';

interface SwapSettingsProps {
    slippage: number;
    onSlippageChange: (value: number) => void;
}

export function SwapSettings({ slippage, onSlippageChange }: SwapSettingsProps) {
    return (
        <div className="bg-gray-700 rounded-xl p-4">
            <h3 className="text-sm text-gray-400 mb-2">Slippage Tolerance</h3>
            <div className="flex space-x-2">
                {[0.1, 0.5, 1.0].map((value) => (
                    <button
                        key={value}
                        className={`px-3 py-1 rounded-lg ${slippage === value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-600 text-gray-400'
                            }`}
                        onClick={() => onSlippageChange(value)}
                    >
                        {value}%
                    </button>
                ))}
                <input
                    type="number"
                    value={slippage}
                    onChange={(e) => onSlippageChange(Number(e.target.value))}
                    className="w-20 bg-gray-600 rounded-lg px-3 py-1 text-white"
                    placeholder="Custom"
                />
            </div>
        </div>
    );
} 