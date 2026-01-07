import { ethers } from "ethers";

export function formatAddress(address: string): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatEther(
  value: bigint | string | number | null | undefined
): string {
  try {
    if (value === null || value === undefined) {
      return "0";
    }
    // Handle BigInt, string, or number
    const bigIntValue =
      typeof value === "bigint" ? value : BigInt(String(value));
    return ethers.formatEther(bigIntValue);
  } catch (error) {
    console.error("Error formatting ether:", error, value);
    return "0";
  }
}

export function parseEther(value: string): bigint {
  try {
    return ethers.parseEther(value);
  } catch {
    throw new Error("Invalid ETH amount");
  }
}

export function formatDate(timestamp: bigint | number): string {
  try {
    const numTimestamp = Number(timestamp);
    if (isNaN(numTimestamp) || numTimestamp === 0) {
      return "Not set";
    }
    const date = new Date(numTimestamp * 1000);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Invalid date";
  }
}

export function isExpired(deadline: bigint | number): boolean {
  return Number(deadline) * 1000 < Date.now();
}

export function calculateProgress(
  collected: bigint | string | number,
  target: bigint | string | number
): number {
  try {
    const collectedNum = Number(collected);
    const targetNum = Number(target);

    if (isNaN(collectedNum) || isNaN(targetNum) || targetNum === 0) {
      return 0;
    }

    const progress = (collectedNum / targetNum) * 100;
    return Math.min(100, Math.max(0, progress));
  } catch {
    return 0;
  }
}
