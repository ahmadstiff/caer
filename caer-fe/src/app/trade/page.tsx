'use client';

import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import SwapPanel from './components/SwapPanel';
import LimitPanel from './components/LimitPanel';
import SendPanel from './components/SendPanel';

export default function TradePage() {
    const tabs = ['Swap', 'Limit', 'Send'];

    return (
        <div className="container mx-auto p-4 max-w-xl">
            <div className="bg-gray-800 rounded-2xl p-4 shadow-lg">
                <Tab.Group>
                    <Tab.List className="flex space-x-1 rounded-xl bg-gray-700 p-1 mb-4">
                        {tabs.map((tab) => (
                            <Tab
                                key={tab}
                                className={({ selected }) =>
                                    `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                  ${selected
                                        ? 'bg-blue-500 text-white shadow'
                                        : 'text-gray-400 hover:bg-gray-600 hover:text-white'
                                    }`
                                }
                            >
                                {tab}
                            </Tab>
                        ))}
                    </Tab.List>
                    <Tab.Panels>
                        <Tab.Panel>
                            <SwapPanel />
                        </Tab.Panel>
                        <Tab.Panel>
                            <LimitPanel />
                        </Tab.Panel>
                        <Tab.Panel>
                            <SendPanel />
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>
        </div>
    );
}
