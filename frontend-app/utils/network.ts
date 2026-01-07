export const SUPPORTED_NETWORKS = {
  HARDHAT: "0x7a69", // 31337
  SEPOLIA: "0xaa36a7", // 11155111
};

export function isSupportedNetwork(chainId: string): boolean {
  return Object.values(SUPPORTED_NETWORKS).includes(chainId);
}

export function getNetworkName(chainId: string): string {
  switch (chainId) {
    case SUPPORTED_NETWORKS.HARDHAT:
      return "Hardhat Local";
    case SUPPORTED_NETWORKS.SEPOLIA:
      return "Sepolia";
    default:
      return "Unknown";
  }
}
