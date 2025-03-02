"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, onClick }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center space-x-3 transition-colors py-4 px-6 w-full group relative
        ${
          isActive
            ? "text-white"
            : "text-gray-200 hover:text-white hover:bg-white/5"
        }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-[#b721ff]/10 via-[#21d4fd]/10 to-[#b721ff]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      {children}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 animate-gradient-x bg-gradient-to-r from-[#b721ff] via-[#21d4fd] to-[#b721ff]" />
      )}
    </Link>
  );
};

export default NavLink;