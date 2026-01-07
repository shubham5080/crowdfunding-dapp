"use client";

import { useState, FormEvent } from "react";
import { ethers } from "ethers";
import { useCampaigns } from "../hooks/useCampaigns";
import { useWallet } from "../hooks/useWallet";
import { getProvider } from "../utils/contract";

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateCampaignModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCampaignModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { createCampaign } = useCampaigns();
  const { address } = useWallet();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!address) return;

    setError(null);

    if (!title.trim() || !description.trim() || !target || !deadline) {
      setError("Please fill all fields");
      return;
    }

    try {
      const targetAmount = parseFloat(target);
      if (isNaN(targetAmount) || targetAmount <= 0) {
        setError("Target amount must be greater than 0");
        return;
      }

      const deadlineDate = new Date(deadline);
      const deadlineTimestamp = Math.floor(deadlineDate.getTime() / 1000);

      if (deadlineTimestamp <= Math.floor(Date.now() / 1000)) {
        setError("Deadline must be in the future");
        return;
      }

      setLoading(true);
      const provider = await getProvider();
      const signer = await provider.getSigner();
      await createCampaign(title, description, target, deadlineTimestamp, signer);

      setTitle("");
      setDescription("");
      setTarget("");
      setDeadline("");
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-md w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create Campaign</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Campaign title"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="Describe your campaign"
              rows={4}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Target (ETH)</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              placeholder="0.0"
              disabled={loading}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Deadline</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Campaign"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
