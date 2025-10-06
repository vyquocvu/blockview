export interface NetworkConfig {
  name: string;
  chainId: number;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls?: string[];
}

export const PREDEFINED_NETWORKS: Record<string, NetworkConfig> = {
  ethereum: {
    name: "Ethereum Mainnet",
    chainId: 1,
    rpcUrls: [
      "https://eth-mainnet.g.alchemy.com/v2/demo",
      "https://ethereum.publicnode.com",
      "https://rpc.ankr.com/eth",
      "https://eth.llamarpc.com"
    ],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://etherscan.io"]
  },
  bnb: {
    name: "BNB Smart Chain",
    chainId: 56,
    rpcUrls: [
      "https://bsc-dataseed.binance.org",
      "https://bsc-dataseed1.defibit.io",
      "https://bsc-dataseed1.ninicoin.io",
      "https://rpc.ankr.com/bsc"
    ],
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18
    },
    blockExplorerUrls: ["https://bscscan.com"]
  },
  viction: {
    name: "Viction",
    chainId: 88,
    rpcUrls: [
      "https://rpc.vicscan.xyz/",
      "https://rpc.tomochain.com"
    ],
    nativeCurrency: {
      name: "Viction",
      symbol: "VIC",
      decimals: 18
    },
    blockExplorerUrls: ["https://www.vicscan.xyz"]
  }
};

export const getNetworkByChainId = (chainId: number): NetworkConfig | undefined => {
  return Object.values(PREDEFINED_NETWORKS).find(network => network.chainId === chainId);
};

export const getNetworkById = (id: string): NetworkConfig | undefined => {
  return PREDEFINED_NETWORKS[id];
};