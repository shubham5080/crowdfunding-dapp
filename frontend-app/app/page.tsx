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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");

  /* ---------------- WALLET ---------------- */

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

  /* ---------------- CONTRACT ---------------- */

  async function getContract() {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }

  /* ---------------- LOAD ---------------- */

  async function loadCampaigns() {
    try {
      const contract = await getContract();
      const data = await contract.getAllCampaigns();
      setCampaigns(data);
    } catch {
      setError("Failed to load campaigns");
    }
  }

  /* ---------------- CREATE ---------------- */

  async function createCampaign() {
    if (!wallet) return;

    if (!title || !description || !target || !deadline) {
      setError("Fill all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const deadlineTs = Math.floor(
        new Date(deadline).getTime() / 1000
      );

      const contract = await getContract();
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
    } catch {
      setError("Create campaign failed");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- DONATE ---------------- */

  async function donate(id: number, amount: string) {
    if (!amount) return;

    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();
      const tx = await contract.donateToCampaign(id, {
        value: ethers.parseEther(amount),
      });

      await tx.wait();
      await loadCampaigns();
    } catch {
      setError("Donation failed");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- WITHDRAW ---------------- */

  async function withdrawFunds(id: number) {
    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();
      const tx = await contract.withdrawFunds(id);

      await tx.wait();
      await loadCampaigns();
    } catch {
      setError("Withdraw failed");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- REFUND ---------------- */

  async function refund(id: number) {
    try {
      setLoading(true);
      setError(null);

      const contract = await getContract();
      const tx = await contract.refund(id);

      await tx.wait();
      await loadCampaigns();
    } catch {
      setError("Refund failed");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- UI ---------------- */

  return (
    <main
      style={{
        padding: 20,
        maxWidth: 900,
        margin: "auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Crowdfunding DApp</h1>

      <p><b>Status:</b> {status}</p>
      <p><b>Network:</b> {network}</p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p style={{ color: "blue" }}>Transaction in progress...</p>}

      {!wallet && (
        <button onClick={connectWallet}>
          Connect Wallet
        </button>
      )}

      {wallet && (
        <>
          <hr />
          <h2>Create Campaign</h2>

          <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <br />

          <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <br />

          <input placeholder="Target (ETH)" value={target} onChange={e => setTarget(e.target.value)} />
          <br />

          <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} />
          <br />

          <button onClick={createCampaign} disabled={loading}>
            {loading ? "Creating..." : "Create Campaign"}
          </button>
        </>
      )}

      <hr />
      <h2>Campaigns</h2>

      {campaigns.map((c, i) => {
        const creator = c[0];
        const title = c[1];
        const description = c[2];
        const targetAmount = c[3];
        const deadlineTs = c[4];
        const collected = c[5];
        const isClosed = c[6];

        const isOwner =
          wallet && wallet.toLowerCase() === creator.toLowerCase();
        const isExpired = Number(deadlineTs) * 1000 < Date.now();

        return (
          <div
            key={i}
            style={{
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
              background: "#fafafa",
            }}
          >
            <h3>{title}</h3>
            <p>{description}</p>

            <p><b>Target:</b> {ethers.formatEther(targetAmount)} ETH</p>
            <p><b>Raised:</b> {ethers.formatEther(collected)} ETH</p>
            <p><b>Status:</b> {isClosed ? "Closed" : "Active"}</p>

            {!isClosed && !isExpired && (
              <>
                <input id={`donate-${i}`} placeholder="ETH amount" />
                <button
                  disabled={loading}
                  onClick={() =>
                    donate(
                      i,
                      (document.getElementById(`donate-${i}`) as HTMLInputElement).value
                    )
                  }
                >
                  Donate
                </button>
              </>
            )}

            {isOwner && isExpired && !isClosed && (
              <button disabled={loading} onClick={() => withdrawFunds(i)}>
                Withdraw
              </button>
            )}

            {!isOwner && isExpired && collected < targetAmount && (
              <button disabled={loading} onClick={() => refund(i)}>
                Refund
              </button>
            )}
          </div>
        );
      })}
    </main>
  );
}
