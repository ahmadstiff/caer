"use client";

import React from "react";
import { Wallet, PiggyBank, LineChart } from "lucide-react";
import NavLink from "./navbar-link";

const DesktopNavigation: React.FC = () => {
  return (
    <div className="hidden md:flex items-center space-x-6">
      <NavLink href="/lending">
        <Wallet className="h-3 w-3 group-hover:scale-110 transition-transform" />
        <span>Lending</span>
      </NavLink>
      <NavLink href="/borrow">
        <PiggyBank className="h-3 w-3 group-hover:scale-110 transition-transform" />
        <span>Borrow</span>
      </NavLink>
      <NavLink href="/trade">
        <LineChart className="h-3 w-3 group-hover:scale-110 transition-transform" />
        <span>Trade</span>
      </NavLink>
    </div>
  );
};

export default DesktopNavigation;