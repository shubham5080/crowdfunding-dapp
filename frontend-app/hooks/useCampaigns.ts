"use client";

import { ethers } from "ethers";
import { useCallback, useState } from "react";
import { CampaignWithId } from "../types";
import {
  getContract,
  getProvider,
  getReadOnlyContract,
} from "../utils/contract";
import { formatEther } from "../utils/format";

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState<CampaignWithId[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = await getProvider();
      const contract = getReadOnlyContract(provider);
      const allCampaigns = await contract.getAllCampaigns();

      // Debug: log raw data structure
      if (allCampaigns.length > 0) {
        console.log("Raw campaign data:", allCampaigns[0]);
      }

      const formatted: CampaignWithId[] = allCampaigns.map(
        (campaign: any, index: number) => {
          // Handle both array and object formats from contract
          // Array format: [creator, title, description, targetAmount, deadline, amountCollected, isClosed]
          // Object format: { creator, title, description, targetAmount, deadline, amountCollected, isClosed }
          const campaignData = Array.isArray(campaign)
            ? {
                creator: campaign[0],
                title: campaign[1],
                description: campaign[2],
                targetAmount: campaign[3],
                deadline: campaign[4],
                amountCollected: campaign[5],
                isClosed: campaign[6],
              }
            : campaign;

          return {
            id: index,
            creator: campaignData.creator || "",
            title: campaignData.title || "",
            description: campaignData.description || "",
            targetAmount: campaignData.targetAmount || BigInt(0),
            deadline: campaignData.deadline || BigInt(0),
            amountCollected: campaignData.amountCollected || BigInt(0),
            isClosed: campaignData.isClosed || false,
          };
        }
      );

      setCampaigns(formatted);
    } catch (err: any) {
      console.error("Error loading campaigns:", err);
      setError("Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCampaign = useCallback(
    async (
      title: string,
      description: string,
      targetAmount: string,
      deadline: number,
      signer: ethers.Signer
    ) => {
      try {
        setLoading(true);
        setError(null);
        const contract = getContract(signer);
        const tx = await contract.createCampaign(
          title,
          description,
          ethers.parseEther(targetAmount),
          deadline
        );
        await tx.wait();
        await loadCampaigns();
        return tx.hash;
      } catch (err: any) {
        console.error("Error creating campaign:", err);
        if (err.code === 4001) {
          throw new Error("Transaction rejected");
        }
        throw new Error("Failed to create campaign");
      } finally {
        setLoading(false);
      }
    },
    [loadCampaigns]
  );

  const donate = useCallback(
    async (campaignId: number, amount: string, signer: ethers.Signer) => {
      try {
        setLoading(true);
        setError(null);
        const contract = getContract(signer);
        const tx = await contract.donateToCampaign(campaignId, {
          value: ethers.parseEther(amount),
        });
        await tx.wait();
        await loadCampaigns();
        return tx.hash;
      } catch (err: any) {
        console.error("Error donating:", err);
        if (err.code === 4001) {
          throw new Error("Transaction rejected");
        }
        throw new Error("Failed to donate");
      } finally {
        setLoading(false);
      }
    },
    [loadCampaigns]
  );

  const withdraw = useCallback(
    async (campaignId: number, signer: ethers.Signer) => {
      try {
        setLoading(true);
        setError(null);
        const contract = getContract(signer);
        const tx = await contract.withdrawFunds(campaignId);
        await tx.wait();
        await loadCampaigns();
        return tx.hash;
      } catch (err: any) {
        console.error("Error withdrawing:", err);
        if (err.code === 4001) {
          throw new Error("Transaction rejected");
        }
        throw new Error("Failed to withdraw funds");
      } finally {
        setLoading(false);
      }
    },
    [loadCampaigns]
  );

  const refund = useCallback(
    async (campaignId: number, signer: ethers.Signer) => {
      try {
        setLoading(true);
        setError(null);
        const contract = getContract(signer);
        const tx = await contract.refund(campaignId);
        await tx.wait();
        await loadCampaigns();
        return tx.hash;
      } catch (err: any) {
        console.error("Error refunding:", err);
        if (err.code === 4001) {
          throw new Error("Transaction rejected");
        }
        throw new Error("Failed to process refund");
      } finally {
        setLoading(false);
      }
    },
    [loadCampaigns]
  );

  const getDonationAmount = useCallback(
    async (campaignId: number, donorAddress: string): Promise<string> => {
      try {
        const provider = await getProvider();
        const contract = getReadOnlyContract(provider);
        const donation = await contract.getDonation(campaignId, donorAddress);
        return formatEther(donation);
      } catch {
        return "0";
      }
    },
    []
  );

  return {
    campaigns,
    loading,
    error,
    loadCampaigns,
    createCampaign,
    donate,
    withdraw,
    refund,
    getDonationAmount,
  };
}
