import { toast } from "@/components/ui/use-toast"; // Menggunakan toast yang telah dikustomisasi dengan Sonner
import { useSignMessage, useAccount } from "wagmi";

interface TransactionHandlerProps {
  amount: string;
  token: string;
  fromChain: any;
  toChain: any;
  recipientAddress: string;
  onSuccess: () => void;
  onLoading: (loading: boolean) => void;
}

export default function useTransactionHandler({
  amount,
  token,
  fromChain,
  toChain,
  recipientAddress,
  onSuccess,
  onLoading,
}: TransactionHandlerProps) {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  // Helper function to get chain emoji
  const getChainEmoji = (chainName: string) => {
    const chainEmojis: Record<string, string> = {
      Arbitrum: "⚡",
      Base: "🔵",
      "Ca Chain": "🌐",
      Ethereum: "💎",
      Optimism: "🔴",
    };

    return chainEmojis[chainName] || "🔗";
  };

  const handleTransaction = async () => {
    try {
      if (!amount || Number.parseFloat(amount) <= 0) {
        toast({
          title: "🚫 Invalid Amount",
          description: "Please enter a valid amount to borrow.",
          variant: "destructive",
        });
        return;
      }

      if (!recipientAddress) {
        toast({
          title: "⚠️ Missing Recipient",
          description: "Please specify a recipient address.",
          variant: "warning",
        });
        return;
      }

      if (!address) {
        toast({
          title: "🔗 Wallet Not Connected",
          description: "Please connect your wallet before proceeding.",
          variant: "destructive",
        });
        return;
      }

      onLoading(true);

      const fromChainEmoji = getChainEmoji(fromChain.name);
      const toChainEmoji = getChainEmoji(toChain.name);

      // Tampilkan toast loading dengan informasi lebih detail
      toast({
        title: `⏳ Bridging ${amount} ${token}...`,
        description: `${fromChainEmoji} **${fromChain.name}** → ${toChainEmoji} **${toChain.name}**\n\nPreparing your cross-chain transaction. This may take a moment...`,
        variant: "info",
      });

      // Pesan yang akan ditandatangani dengan format yang lebih menarik
      const messageToSign = `🌉 Cross-Chain Bridge Request:
💰 Amount: ${amount} ${token}
${fromChainEmoji} From: ${fromChain.name} (Chain ID: ${fromChain.id})
${toChainEmoji} To: ${toChain.name} (Chain ID: ${toChain.id})
📬 Recipient: ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}
⏱️ Timestamp: ${new Date().toLocaleString()}`;

      toast({
        title: "✍️ Signature Required",
        description: `${fromChainEmoji} → ${toChainEmoji} Please sign the message in your wallet to authorize sending **${amount} ${token}** from **${fromChain.name}** to **${toChain.name}**.`,
        variant: "info",
      });

      const signature = await signMessageAsync({ message: messageToSign });

      toast({
        title: "🔄 Processing Transaction",
        description: `${fromChainEmoji} → ${toChainEmoji} Your transaction is being processed on the blockchain. Please wait...`,
        variant: "info",
      });

      // Kirim request ke backend
      const response = await fetch(
        "https://solver-caer-fi.vercel.app/api/borrow",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount,
            userAddress: address,
            recipientAddress,
            fromChain: fromChain.id,
            toChain: toChain.id,
            signature,
            message: messageToSign,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Format transaction hash for display
        const txHash = data.data?.transactionHash || "";
        const formattedTxHash = txHash
          ? `${txHash.slice(0, 6)}...${txHash.slice(-4)}`
          : "";

        const txExplorerLink = txHash
          ? `[View on Explorer](https://explorer.cachain.io/tx/${txHash})`
          : "";

        toast({
          title: "✅ Transaction Successful!",
          description: `${fromChainEmoji} → ${toChainEmoji} **${amount} ${token}** successfully borrow from **${
            fromChain.name
          }** to **${toChain.name}**!\n\n$`,
          variant: "success",
        });

        onSuccess();
      } else {
        throw new Error(data.message || "Transaction failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      toast({
        title: "❌ Bridge Failed",
        description: `${getChainEmoji(fromChain.name)} → ${getChainEmoji(
          toChain.name
        )} Failed to bridge **${amount} ${token}** from **${
          fromChain.name
        }** to **${toChain.name}**.\n\n⚠️ Error: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      onLoading(false);
    }
  };

  return { handleTransaction };
}
