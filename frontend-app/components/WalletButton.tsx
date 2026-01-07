"use client";

import { useWallet } from "../hooks/useWallet";
import { formatAddress } from "../utils/format";

export function WalletButton() {
  const { address, isConnected, connect, disconnect, networkName } = useWallet();

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm">
        <span className="text-gray-600 dark:text-gray-400">{networkName}</span>
      </div>
      <div className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-mono">
        {formatAddress(address!)}
      </div>
      <button
        onClick={disconnect}
        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
      >
        Disconnect
      </button>
    </div>
  );
}
