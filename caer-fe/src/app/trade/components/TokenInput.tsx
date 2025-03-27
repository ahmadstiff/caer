import React from 'react';

interface TokenInputProps {
    label: string;
    value: {
        symbol: string;
        amount: string;
    };
    onChange: (value: { symbol: string; amount: string }) => void;
}

export function TokenInput({ label, value, onChange }: TokenInputProps) {
    return (
        <div className="bg-gray-700 rounded-xl p-4 space-y-2">
            <label className="text-sm text-gray-400">{label}</label>
            <div className="flex items-center space-x-4">
                <input
                    type="number"
                    value={value.amount}
                    onChange={(e) => onChange({ ...value, amount: e.target.value })}
                    className="flex-1 bg-transparent text-xl text-white focus:outline-none"
                    placeholder="0.0"
                />
                <button
                    className="bg-gray-600 hover:bg-gray-500 rounded-xl px-4 py-2 text-white"
                    onClick={() => {
                        // Implementasi token selector
                    }}
                >
                    {value.symbol}
                </button>
            </div>
        </div>
    );
} 