import React from 'react';

interface OrderBookProps {
    orderBook: {
        bids: Array<{
            price: number;
            amount: number;
        }>;
        asks: Array<{
            price: number;
            amount: number;
        }>;
    };
}

export function OrderBook({ orderBook }: OrderBookProps) {
    return (
        <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Order Book</h2>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <h3 className="text-green-500 mb-2">Bids</h3>
                    {orderBook.bids.map((bid) => (
                        <div key={bid.price} className="text-green-400 flex justify-between">
                            <span>{bid.price.toFixed(2)}</span>
                            <span>{bid.amount.toFixed(4)}</span>
                        </div>
                    ))}
                </div>
                <div>
                    <h3 className="text-red-500 mb-2">Asks</h3>
                    {orderBook.asks.map((ask) => (
                        <div key={ask.price} className="text-red-400 flex justify-between">
                            <span>{ask.price.toFixed(2)}</span>
                            <span>{ask.amount.toFixed(4)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
} 