import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createWalletClient, http } from "viem";
import { polygon } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ambil private key dari .env
const PRIVATE_KEY = process.env.SEQUENCER_PRIVATE_KEY as string;
if (!PRIVATE_KEY) {
  throw new Error("Private key tidak ditemukan di .env");
}

const account = privateKeyToAccount(PRIVATE_KEY);
const walletClient = createWalletClient({
  chain: polygon,
  transport: http(),
  account,
});

// API Endpoint untuk relay transaksi borrow
app.post("/relay-borrow", async (req: Request, res: Response) => {
  try {
    const { borrower, amount, nonce } = req.body;

    if (!borrower || !amount) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const txData = {
      to: "0xContractAddressOnPolygon", // Ganti dengan smart contract yang benar
      value: 0n,
      data: "0x...", // ABI encode untuk fungsi borrow di smart contract
      gas: 500000n,
    };

    // Tandatangani transaksi dengan Viem
    const signedTx = await walletClient.signTransaction(txData);

    // Kirim transaksi ke Blockchain B (Polygon)
    const txHash = await walletClient.sendTransaction(signedTx);

    res.json({ success: true, txHash });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Jalankan server di port 4000
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Sequencer backend running on port ${PORT}`));
