export interface Campaign {
  creator: string;
  title: string;
  description: string;
  targetAmount: bigint;
  deadline: bigint;
  amountCollected: bigint;
  isClosed: boolean;
}

export interface CampaignWithId extends Campaign {
  id: number;
}

export type CampaignStatus = "active" | "expired" | "closed" | "successful";

export interface NetworkConfig {
  chainId: string;
  name: string;
  rpcUrl?: string;
}
