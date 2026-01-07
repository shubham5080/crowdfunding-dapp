"use client";

import { useWallet } from "../hooks/useWallet";

export function NetworkWarning() {
  const { isConnected, isCorrectNetwork, networkName } = useWallet();

  if (!isConnected || isCorrectNetwork) {
    return null;
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2">
        <svg
          className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
          Please switch to Hardhat (31337) or Sepolia (11155111) network. Current: {networkName}
        </p>
      </div>
    </div>
  );
}
