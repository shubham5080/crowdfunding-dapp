"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../config";

export default function Home() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [status, setStatus] = useState("Wallet not connected");

  async function connectWallet() {
    if (!(window as any).ethereum) {
      alert("MetaMask not installed");
      return;
    }

    const accounts = await (window as any).ethereum.request({
      method: "eth_requestAccounts",
    });

    setWallet(accounts[0]);
    setStatus("Wallet connected");
  }

  async function loadCampaigns() {
    if (!wallet) return;

    if (CONTRACT_ADDRESS === "PASTE_LATER") {
      setStatus("Contract not deployed yet");
      return;
    }

    const provider = new ethers.BrowserProvider(
      (window as any).ethereum
    );

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      provider
    );

    const data = await contract.getAllCampaigns();
    setCampaigns(data);
    setStatus("Campaigns loaded");
  }

  useEffect(() => {
    loadCampaigns();
  }, [wallet]);

  return (
    <main style={{ padding: 20 }}>
      <h1>Crowdfunding DApp</h1>

      <p>Status: {status}</p>

      {!wallet && (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      )}

      {wallet && campaigns.length === 0 && (
        <p>No campaigns to show yet.</p>
      )}

      {campaigns.map((c, i) => (
        <div
          key={i}
          style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}
        >
          <h3>{c.title}</h3>
          <p>{c.description}</p>
          <p>Target: {ethers.formatEther(c.targetAmount)} ETH</p>
          <p>Raised: {ethers.formatEther(c.amountCollected)} ETH</p>
        </div>
      ))}
    </main>
  );
}

