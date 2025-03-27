import React, { useState } from 'react';
import { TokenInput } from './TokenInput';

export default function SendPanel() {
    const [token, setToken] = useState({
        symbol: 'ETH',
        amount: '',
    });
    const [recipient, setRecipient] = useState('');

    const handleSend = () => {
        // Implementasi logika pengiriman
        console.log('Sending tokens:', { token, recipient });
    };

    return (
        <div className="space-y-4">
            <TokenInput
                label="Asset"
                value={token}
                onChange={setToken}
            />

            <div className="space-y-2">
                <label className="text-sm text-gray-400">Recipient Address</label>
                <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    className="w-full bg-gray-700 rounded-xl p-3 text-white"
                    placeholder="Enter wallet address"
                />
            </div>

            <button
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl"
                onClick={handleSend}
            >
                Send
            </button>
        </div>
    );
} 