import React from 'react';

interface TradeHistoryProps {
    history: Array<{
        price: number;
        amount: number;
        timestamp: number;
    }>;
}

export function TradeHistory({ history }: TradeHistoryProps) {
    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Trade History</h2>
            <div className="space-y-2">
                {history.map((trade, index) => (
                    <div key={index} className="flex justify-between text-sm">
                        <span>{new Date(trade.timestamp).toLocaleTimeString()}</span>
                        <span>{trade.price.toFixed(2)}</span>
                        <span>{trade.amount.toFixed(4)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
} 