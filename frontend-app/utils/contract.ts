import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "../config";

export function getContract(signer: ethers.Signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

export function getReadOnlyContract(provider: ethers.Provider) {
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

export async function getProvider() {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  throw new Error("MetaMask not available");
}
