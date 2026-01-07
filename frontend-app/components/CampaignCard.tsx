"use client";

import { useEffect, useState } from "react";
import { useCampaigns } from "../hooks/useCampaigns";
import { useWallet } from "../hooks/useWallet";
import { CampaignStatus, CampaignWithId } from "../types";
import { getProvider } from "../utils/contract";
import {
  calculateProgress,
  formatDate,
  formatEther,
  isExpired,
} from "../utils/format";

interface CampaignCardProps {
  campaign: CampaignWithId;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const [donateAmount, setDonateAmount] = useState("");
  const [donationAmount, setDonationAmount] = useState("0");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { address, isConnected } = useWallet();
  const { donate, withdraw, refund, getDonationAmount } = useCampaigns();

  const isOwner = address?.toLowerCase() === campaign.creator?.toLowerCase();
  const expired = isExpired(campaign.deadline);
  const targetReached = campaign.amountCollected >= campaign.targetAmount;
  const progress = calculateProgress(
    campaign.amountCollected,
    campaign.targetAmount
  );

  let status: CampaignStatus = "active";
  if (campaign.isClosed) {
    status = targetReached ? "successful" : "closed";
  } else if (expired) {
    status = "expired";
  }

  useEffect(() => {
    if (address && isConnected) {
      getDonationAmount(campaign.id, address).then(setDonationAmount);
    }
  }, [address, isConnected, campaign.id, getDonationAmount]);

  const handleDonate = async () => {
    if (!address || !isConnected) return;

    const amount = parseFloat(donateAmount);
    if (isNaN(amount) || amount <= 0) {
      setActionError("Please enter a valid amount");
      return;
    }

    try {
      setActionLoading(true);
      setActionError(null);
      const provider = await getProvider();
      const signer = await provider.getSigner();
      await donate(campaign.id, donateAmount, signer);
      setDonateAmount("");
      setActionError(null);
    } catch (err: any) {
      setActionError(err.message || "Donation failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!address || !isConnected) return;

    try {
      setActionLoading(true);
      setActionError(null);
      const provider = await getProvider();
      const signer = await provider.getSigner();
      await withdraw(campaign.id, signer);
      setActionError(null);
    } catch (err: any) {
      setActionError(err.message || "Withdrawal failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefund = async () => {
    if (!address || !isConnected) return;

    try {
      setActionLoading(true);
      setActionError(null);
      const provider = await getProvider();
      const signer = await provider.getSigner();
      await refund(campaign.id, signer);
      setActionError(null);
    } catch (err: any) {
      setActionError(err.message || "Refund failed");
    } finally {
      setActionLoading(false);
    }
  };

  const canDonate = isConnected && !expired && !campaign.isClosed;
  const canWithdraw = isOwner && expired && targetReached && !campaign.isClosed;
  const canRefund =
    isConnected &&
    !isOwner &&
    expired &&
    !targetReached &&
    parseFloat(donationAmount) > 0;

  const statusColors = {
    active:
      "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    expired:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    closed: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
    successful:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {campaign.title}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
        {campaign.description}
      </p>

      <div className="space-y-3 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Raised</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatEther(campaign.amountCollected)} ETH
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Target</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatEther(campaign.targetAmount)} ETH
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
          {progress.toFixed(1)}% funded
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-3">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Deadline</span>
          <span>{formatDate(campaign.deadline)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
          <span>Creator</span>
          <span className="font-mono text-xs">
            {campaign.creator
              ? `${campaign.creator.slice(0, 6)}...${campaign.creator.slice(
                  -4
                )}`
              : "Unknown"}
          </span>
        </div>
      </div>

      {isConnected && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4 space-y-3">
          {canDonate && (
            <div className="flex gap-2">
              <input
                type="number"
                step="0.001"
                min="0"
                value={donateAmount}
                onChange={(e) => setDonateAmount(e.target.value)}
                placeholder="Amount (ETH)"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
                disabled={actionLoading}
              />
              <button
                onClick={handleDonate}
                disabled={actionLoading || !donateAmount}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {actionLoading ? "..." : "Donate"}
              </button>
            </div>
          )}

          {canWithdraw && (
            <button
              onClick={handleWithdraw}
              disabled={actionLoading}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {actionLoading ? "Processing..." : "Withdraw Funds"}
            </button>
          )}

          {canRefund && (
            <div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                Your donation: {donationAmount} ETH
              </div>
              <button
                onClick={handleRefund}
                disabled={actionLoading}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                {actionLoading ? "Processing..." : "Request Refund"}
              </button>
            </div>
          )}

          {actionError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2 text-xs text-red-800 dark:text-red-200">
              {actionError}
            </div>
          )}
        </div>
      )}

      {!isConnected && (
        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Connect wallet to interact
        </div>
      )}
    </div>
  );
}
