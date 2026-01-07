"use client";

import { useState, useEffect } from "react";
import { WalletButton } from "../components/WalletButton";
import { NetworkWarning } from "../components/NetworkWarning";
import { CreateCampaignModal } from "../components/CreateCampaignModal";
import { CampaignCard } from "../components/CampaignCard";
import { useWallet } from "../hooks/useWallet";
import { useCampaigns } from "../hooks/useCampaigns";

export default function Home() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { isConnected, isCorrectNetwork } = useWallet();
  const { campaigns, loading, error, loadCampaigns } = useCampaigns();

  useEffect(() => {
    if (isConnected && isCorrectNetwork) {
      loadCampaigns();
    }
  }, [isConnected, isCorrectNetwork, loadCampaigns]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Crowdfunding DApp
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Decentralized fundraising platform
              </p>
            </div>
            <WalletButton />
          </div>
        </header>

        {/* Network Warning */}
        <NetworkWarning />

        {/* Main Content */}
        {isConnected && isCorrectNetwork && (
          <div className="mb-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
            >
              + Create Campaign
            </button>
          </div>
        )}

        {/* Campaigns Section */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Campaigns
          </h2>

          {loading && campaigns.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Loading campaigns...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {!loading && campaigns.length === 0 && !error && (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-gray-600 dark:text-gray-400">
                {isConnected && isCorrectNetwork
                  ? "No campaigns yet. Create one to get started!"
                  : "Connect your wallet to view campaigns"}
              </p>
            </div>
          )}

          {campaigns.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          loadCampaigns();
        }}
      />
    </main>
  );
}
