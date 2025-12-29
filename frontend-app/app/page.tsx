"use client";

import { useState } from "react";
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
  const [network, setNetwork] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");

  /* ---------------- CONNECT WALLET ---------------- */
  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("MetaMask not installed");
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    setNetwork(parseInt(chainId, 16).toString());

    if (chainId !== "0x7a69") {
      setStatus("Please switch to Hardhat network (31337)");
      return;
    }

    setWallet(accounts[0]);
    setStatus("Wallet connected");

    await loadCampaigns();
  }

  /* ---------------- LOAD CAMPAIGNS ---------------- */
  async function loadCampaigns() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      const data = await contract.getAllCampaigns();
      setCampaigns(data);
      setStatus("Campaigns loaded");
    } catch (err: any) {
      setStatus("Error loading campaigns: " + err.message);
    }
  }

  /* ---------------- CREATE CAMPAIGN ---------------- */
  async function createCampaign() {
    if (!wallet) return;

    if (!title || !description || !target || !deadline) {
      setStatus("Fill all fields");
      return;
    }

    const deadlineTs = Math.floor(
      new Date(deadline).getTime() / 1000
    );

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      CONTRACT_ABI,
      signer
    );

    const tx = await contract.createCampaign(
      title,
      description,
      ethers.parseEther(target),
      deadlineTs
    );

    await tx.wait();

    setTitle("");
    setDescription("");
    setTarget("");
    setDeadline("");
    setStatus("Campaign created");

    await loadCampaigns();
  }

  /* ---------------- UI ---------------- */
  return (
    <main style={{ padding: 20 }}>
      <h1>Crowdfunding DApp</h1>

      <p><b>Status:</b> {status}</p>
      <p><b>Network:</b> {network}</p>

      {!wallet && (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}

      {wallet && (
        <div style={{ marginTop: 20 }}>
          <h2>Create Campaign</h2>

          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <br />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <br />

          <input
            placeholder="Target (ETH)"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />

          <br />

          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          <br />

          <button onClick={createCampaign}>Create Campaign</button>
        </div>
      )}

      <hr />

      <h2>Campaigns</h2>

      {campaigns.map((c, i) => (
        <div
          key={i}
          style={{
            border: "1px solid #ccc",
            padding: 10,
            marginBottom: 10,
          }}
        >
          <h3>{c[1]}</h3> {/* title */}
          <p>{c[2]}</p>   {/* description */}

          <p>
            <b>Target:</b>{" "}
            {ethers.formatEther(c[3])} ETH
          </p>

          <p>
            <b>Raised:</b>{" "}
            {ethers.formatEther(c[5])} ETH
          </p>

          <p>
            <b>Deadline:</b>{" "}
            {new Date(Number(c[4]) * 1000).toLocaleString()}
          </p>
        </div>
      ))}
    </main>
  );
}
