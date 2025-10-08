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
  type?: 'mainnet' | 'testnet';
  logo?: string; // Network logo identifier or emoji
}

export const PREDEFINED_NETWORKS: Record<string, NetworkConfig> = {
  ethereum: {
    name: "Ethereum Mainnet",
    chainId: 1,
    rpcUrls: [
      "https://ethereum.publicnode.com",
      "https://eth.llamarpc.com",
      "https://cloudflare-eth.com",
      "https://rpc.ankr.com/eth"
    ],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://etherscan.io"],
    type: "mainnet",
    logo: "⟠"
  },
  sepolia: {
    name: "Ethereum Sepolia Testnet",
    chainId: 11155111,
    rpcUrls: [
      "https://ethereum-sepolia.publicnode.com",
      "https://rpc.sepolia.org",
      "https://rpc2.sepolia.org"
    ],
    nativeCurrency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
    type: "testnet",
    logo: "⟠"
  },
  bnb: {
    name: "BNB Smart Chain Mainnet",
    chainId: 56,
    rpcUrls: [
      "https://bsc-dataseed.bnbchain.org",
      "https://bsc.publicnode.com",
      "https://bsc-dataseed.binance.org",
      "https://rpc.ankr.com/bsc"
    ],
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18
    },
    blockExplorerUrls: ["https://bscscan.com"],
    type: "mainnet",
    logo: "🔶"
  },
  bnbTestnet: {
    name: "BNB Smart Chain Testnet",
    chainId: 97,
    rpcUrls: [
      "https://bsc-testnet.publicnode.com",
      "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
      "https://bsc-testnet.public.blastapi.io"
    ],
    nativeCurrency: {
      name: "BNB",
      symbol: "tBNB",
      decimals: 18
    },
    blockExplorerUrls: ["https://testnet.bscscan.com"],
    type: "testnet",
    logo: "🔶"
  },
  polygon: {
    name: "Polygon Mainnet",
    chainId: 137,
    rpcUrls: [
      "https://polygon-bor-rpc.publicnode.com",
      "https://polygon-rpc.com",
      "https://rpc-mainnet.matic.quiknode.pro",
      "https://polygon.llamarpc.com"
    ],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    blockExplorerUrls: ["https://polygonscan.com"],
    type: "mainnet",
    logo: "🟣"
  },
  mumbai: {
    name: "Polygon Mumbai Testnet",
    chainId: 80001,
    rpcUrls: [
      "https://rpc-mumbai.maticvigil.com",
      "https://polygon-mumbai.g.alchemy.com/v2/demo"
    ],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    blockExplorerUrls: ["https://mumbai.polygonscan.com"],
    type: "testnet",
    logo: "🟣"
  },
  avalanche: {
    name: "Avalanche C-Chain",
    chainId: 43114,
    rpcUrls: [
      "https://avalanche-c-chain-rpc.publicnode.com",
      "https://api.avax.network/ext/bc/C/rpc",
      "https://avalanche.public-rpc.com"
    ],
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18
    },
    blockExplorerUrls: ["https://snowtrace.io"],
    type: "mainnet",
    logo: "🔺"
  },
  fuji: {
    name: "Avalanche Fuji Testnet",
    chainId: 43113,
    rpcUrls: [
      "https://api.avax-test.network/ext/bc/C/rpc"
    ],
    nativeCurrency: {
      name: "Avalanche",
      symbol: "AVAX",
      decimals: 18
    },
    blockExplorerUrls: ["https://testnet.snowtrace.io"],
    type: "testnet",
    logo: "🔺"
  },
  base: {
    name: "Base Mainnet",
    chainId: 8453,
    rpcUrls: [
      "https://base-rpc.publicnode.com",
      "https://mainnet.base.org",
      "https://base.llamarpc.com"
    ],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://basescan.org"],
    type: "mainnet",
    logo: "🔵"
  },
  baseSepolia: {
    name: "Base Sepolia Testnet",
    chainId: 84532,
    rpcUrls: [
      "https://sepolia.base.org"
    ],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://sepolia.basescan.org"],
    type: "testnet",
    logo: "🔵"
  },
  arbitrum: {
    name: "Arbitrum One",
    chainId: 42161,
    rpcUrls: [
      "https://arbitrum-one-rpc.publicnode.com",
      "https://arb1.arbitrum.io/rpc",
      "https://arbitrum.llamarpc.com"
    ],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://arbiscan.io"],
    type: "mainnet",
    logo: "🔷"
  },
  arbitrumSepolia: {
    name: "Arbitrum Sepolia Testnet",
    chainId: 421614,
    rpcUrls: [
      "https://sepolia-rollup.arbitrum.io/rpc"
    ],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://sepolia.arbiscan.io"],
    type: "testnet",
    logo: "🔷"
  },
  optimism: {
    name: "Optimism Mainnet",
    chainId: 10,
    rpcUrls: [
      "https://optimism-rpc.publicnode.com",
      "https://mainnet.optimism.io",
      "https://optimism.llamarpc.com"
    ],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
    type: "mainnet",
    logo: "🔴"
  },
  optimismSepolia: {
    name: "Optimism Sepolia Testnet",
    chainId: 11155420,
    rpcUrls: [
      "https://sepolia.optimism.io"
    ],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    blockExplorerUrls: ["https://sepolia-optimism.etherscan.io"],
    type: "testnet",
    logo: "🔴"
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
    blockExplorerUrls: ["https://www.vicscan.xyz"],
    type: "mainnet",
    logo: "🟢"
  }
};

// Note: Solana, Sui, and native Tron are not EVM-compatible chains and cannot be added here.
// This explorer is designed for EVM-compatible blockchains only.
// For those chains, please use their respective native explorers.

export const getNetworkByChainId = (chainId: number): NetworkConfig | undefined => {
  return Object.values(PREDEFINED_NETWORKS).find(network => network.chainId === chainId);
};

export const getNetworkById = (id: string): NetworkConfig | undefined => {
  return PREDEFINED_NETWORKS[id];
};