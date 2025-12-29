"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../config";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Home() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [status, setStatus] = useState("Wallet not connected");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [network, setNetwork] = useState("");

async function connectWallet() {
  console.log("connectWallet called");
  const ethereum = window.ethereum;
  if (!ethereum) {
    console.log("No ethereum");
    setStatus("MetaMask not installed");
    return;
  }

  try {
    console.log("Requesting accounts");
    const accounts = await ethereum.request({
      method: "eth_requestAccounts",
    });
    console.log("Accounts:", accounts);

    // Check network
    const chainId = await ethereum.request({ method: "eth_chainId" });
    setNetwork(parseInt(chainId, 16).toString());
    console.log("ChainId:", chainId);
    if (chainId !== "0x7a69") { // 31337 in hex
      setStatus("Please connect to Hardhat local network (chain ID 31337)");
      return;
    }

    setWallet(accounts[0]);
    setStatus("Wallet connected");

    // ⬇️ load campaigns AFTER permission is granted
    await loadCampaigns();
  } catch (error) {
    console.error("Error connecting wallet:", error);
    setStatus("Error connecting wallet: " + (error as Error).message);
  }
}

async function createCampaign() {
  if (!wallet) return;

  if (!title || !description || !target || !deadline) {
    setStatus("Please fill all fields");
    return;
  }

  const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
  if (deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
    setStatus("Deadline must be in the future");
    return;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

    const targetAmount = ethers.parseEther(target);

    const tx = await contract.createCampaign(title, description, targetAmount, deadlineTimestamp);
    await tx.wait();

    setStatus("Campaign created");
    setTitle("");
    setDescription("");
    setTarget("");
    setDeadline("");
    await loadCampaigns();
  } catch (error) {
    console.error("Error creating campaign:", error);
    setStatus("Error creating campaign: " + (error as Error).message);
  }
}

async function loadCampaigns() {
  console.log("loadCampaigns called");
  if (!window.ethereum) return;

  try {
    console.log("Creating provider");
    const provider = new ethers.BrowserProvider(window.ethereum);

    // ✅ ENSURE signer is available
    console.log("Getting signer");
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );

    console.log("Calling getAllCampaigns");
    const data = await contract.getAllCampaigns();
    console.log("Campaigns data:", data);
    setCampaigns(data);
    setStatus("Campaigns loaded");
  } catch (error) {
    console.error("Error loading campaigns:", error);
    setStatus("Error loading campaigns: " + (error as Error).message);
  }
}

async function switchToHardhat() {
  if (!window.ethereum) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x7a69" }],
    });
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: "0x7a69",
              chainName: "Hardhat Local",
              rpcUrls: ["http://127.0.0.1:8545"],
              nativeCurrency: {
                name: "Ether",
                symbol: "ETH",
                decimals: 18,
              },
            },
          ],
        });
      } catch (addError) {
        console.error("Error adding network:", addError);
      }
    } else {
      console.error("Error switching network:", switchError);
    }
  }
}


  return (
    <main style={{ padding: 20 }}>
      <h1>Crowdfunding DApp</h1>

      <p>Status: {status}</p>
      <p>Network: {network}</p>
      {status === "Please connect to Hardhat local network (chain ID 31337)" && (
        <button onClick={switchToHardhat}>Switch to Hardhat Network</button>
      )}

      {!wallet && (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      )}

      {wallet && (
        <div style={{ marginTop: 20 }}>
          <h2>Create Campaign</h2>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ display: "block", margin: 5, padding: 5 }}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ display: "block", margin: 5, padding: 5 }}
          />
          <input
            type="text"
            placeholder="Target Amount (ETH)"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            style={{ display: "block", margin: 5, padding: 5 }}
          />
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={{ display: "block", margin: 5, padding: 5 }}
          />
          <button onClick={createCampaign}>Create Campaign</button>
        </div>
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

