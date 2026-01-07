"use client";

import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { isSupportedNetwork, getNetworkName } from "../utils/network";

declare global {
  interface Window {
    ethereum?: any;
  }
}

interface UseWalletReturn {
  address: string | null;
  isConnected: boolean;
  network: string | null;
  networkName: string;
  isCorrectNetwork: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
}

export function useWallet(): UseWalletReturn {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<string | null>(null);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false);

  const checkConnection = useCallback(async () => {
    if (!window.ethereum) {
      setAddress(null);
      setNetwork(null);
      setIsCorrectNetwork(false);
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.listAccounts();
      const network = await provider.getNetwork();

      if (accounts.length > 0) {
        setAddress(accounts[0].address);
        const chainId = `0x${network.chainId.toString(16)}`;
        setNetwork(chainId);
        setIsCorrectNetwork(isSupportedNetwork(chainId));
      } else {
        setAddress(null);
        setNetwork(null);
        setIsCorrectNetwork(false);
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
      setAddress(null);
      setNetwork(null);
      setIsCorrectNetwork(false);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error("MetaMask not installed");
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      setAddress(accounts[0]);
      setNetwork(chainId);
      setIsCorrectNetwork(isSupportedNetwork(chainId));

      // Listen for network changes
      window.ethereum.on("chainChanged", (newChainId: string) => {
        setNetwork(newChainId);
        setIsCorrectNetwork(isSupportedNetwork(newChainId));
        window.location.reload();
      });

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          setAddress(null);
        } else {
          setAddress(accounts[0]);
        }
      });
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error("Connection rejected");
      }
      throw error;
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setNetwork(null);
    setIsCorrectNetwork(false);
  }, []);

  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  return {
    address,
    isConnected: !!address,
    network,
    networkName: network ? getNetworkName(network) : "",
    isCorrectNetwork,
    connect,
    disconnect,
    refresh: checkConnection,
  };
}
