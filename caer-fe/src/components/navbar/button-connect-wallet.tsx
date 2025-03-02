"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChevronDown, ExternalLink } from "lucide-react";
import { BackgroundGradient } from "../ui/background-gradient";

const ButtonConnectWallet = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openChainModal,
        openConnectModal,
        openAccountModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== "loading";

        if (!ready) {
          return (
            <div
              aria-hidden={true}
              className="opacity-0 pointer-events-none select-none"
            />
          );
        }

        if (!account || !chain) {
          return (
            <button
              onClick={openConnectModal}
              type="button"
              className="flex items-center justify-center space-x-1.5 px-6 py-2 rounded-3xl bg-primary text-primary-foreground font-medium transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Connect Wallet</span>
            </button>
          );
        }

        if (chain.unsupported) {
          return (
            <button
              onClick={openChainModal}
              type="button"
              className="flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-medium transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Wrong Network</span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={openChainModal}
              type="button"
              className="flex items-center justify-center space-x-1 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 font-medium transition-all"
            >
              {chain.hasIcon && chain.iconUrl && (
                <img
                  src={chain.iconUrl || "/placeholder.svg"}
                  alt={chain.name || "Chain icon"}
                  className="w-4 h-4 rounded-full mr-1"
                  style={{ background: chain.iconBackground }}
                />
              )}
              <span>{chain.name}</span>
              <ChevronDown className="w-4 h-4 ml-1 opacity-70" />
            </button>

            <button
              onClick={openAccountModal}
              type="button"
              className="flex items-center justify-center space-x-1 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium transition-all"
            >
              <span className="truncate max-w-[120px]">
                {account.displayName}
              </span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 opacity-70" />
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

const GradientConnectWallet = () => {
  return (
    <div className="relative group">
      <BackgroundGradient className="rounded-xl p-[2px] shadow-lg">
        <ButtonConnectWallet />
      </BackgroundGradient>
    </div>
  );
};

export default GradientConnectWallet;
