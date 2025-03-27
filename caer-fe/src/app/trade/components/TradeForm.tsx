import React, { useState } from 'react';

interface TradeFormProps {
    onTrade: (order: {
        price: number;
        amount: number;
        type: 'buy' | 'sell';
    }) => void;
}

export function TradeForm({ onTrade }: TradeFormProps) {
    const [price, setPrice] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<'buy' | 'sell'>('buy');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onTrade({
            price: Number(price),
            amount: Number(amount),
            type,
        });
        setPrice('');
        setAmount('');
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg mb-4">
            <h2 className="text-xl font-semibold mb-4">Place Order</h2>
            <div className="space-y-4">
                <div>
                    <label className="block mb-1">Price</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1">Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full p-2 rounded bg-gray-700"
                        required
                    />
                </div>
                <div>
                    <label className="block mb-1">Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value as 'buy' | 'sell')}
                        className="w-full p-2 rounded bg-gray-700"
                    >
                        <option value="buy">Buy</option>
                        <option value="sell">Sell</option>
                    </select>
                </div>
                <button
                    type="submit"
                    className={`w-full p-2 rounded ${type === 'buy' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                >
                    Place {type.toUpperCase()} Order
                </button>
            </div>
        </form>
    );
} 