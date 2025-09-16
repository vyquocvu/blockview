import { ethers } from "ethers";
import { ERC20_TOKENS, ERC721_TOKENS, type Erc20Token, type Erc721Token } from "./tokens";

// Default RPC URL
let rpcUrl = localStorage.getItem("custom_rpc_url") || "https://rpc.viction.xyz";

// Initialize provider with the RPC URL
let provider = new ethers.JsonRpcProvider(rpcUrl);

// Function to update the RPC URL and reinitialize the provider
export function updateRpcUrl(newRpcUrl: string) {
  rpcUrl = newRpcUrl;
  provider = new ethers.JsonRpcProvider(rpcUrl);
  localStorage.setItem("custom_rpc_url", rpcUrl);
  return provider;
}

// Function to get the latest block number
export async function getLatestBlockNumber() {
  try {
    return await provider.getBlockNumber();
  } catch (error) {
    console.error("Error fetching latest block number:", error);
    throw error;
  }
}

// Function to get a specific block by number
export async function getBlock(blockNumber: number) {
  try {
    return await provider.getBlock(blockNumber);
  } catch (error) {
    console.error(`Error fetching block ${blockNumber}:`, error);
    throw error;
  }
}

// Function to get multiple blocks (for block list)
export async function getBlocks(count: number) {
  try {
    const latestBlockNumber = await getLatestBlockNumber();
    const blocks = [];
    
    for (let i = 0; i < count; i++) {
      const blockNumber = latestBlockNumber - i;
      if (blockNumber >= 0) {
        const block = await getBlock(blockNumber);
        if (block) blocks.push(block);
      }
    }
    
    return blocks;
  } catch (error) {
    console.error("Error fetching blocks:", error);
    throw error;
  }
}

// Function to get transaction by hash
export async function getTransaction(txHash: string) {
  try {
    return await provider.getTransaction(txHash);
  } catch (error) {
    console.error(`Error fetching transaction ${txHash}:`, error);
    throw error;
  }
}

// Function to get transaction receipt
export async function getTransactionReceipt(txHash: string) {
  try {
    return await provider.getTransactionReceipt(txHash);
  } catch (error) {
    console.error(`Error fetching transaction receipt ${txHash}:`, error);
    throw error;
  }
}

// Function to get account balance
export async function getBalance(address: string) {
  try {
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error(`Error fetching balance for ${address}:`, error);
    throw error;
  }
}

// Function to get account transaction count
export async function getTransactionCount(address: string) {
  try {
    return await provider.getTransactionCount(address);
  } catch (error) {
    console.error(`Error fetching transaction count for ${address}:`, error);
    throw error;
  }
}

// Function to get account code (for contracts)
export async function getCode(address: string) {
  try {
    return await provider.getCode(address);
  } catch (error) {
    console.error(`Error fetching code for ${address}:`, error);
    throw error;
  }
}


// Function to format timestamp to date
export function formatTimestamp(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString();
}

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)'
];

const ERC721_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)'
];

export async function getTokenBalances(address: string) {
  const balances: Array<{ token: Erc20Token; balance: string }> = [];
  for (const token of ERC20_TOKENS) {
    try {
      const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
      const bal: bigint = await contract.balanceOf(address);
      if (bal > 0n) {
        balances.push({ token, balance: ethers.formatUnits(bal, token.decimals) });
      }
    } catch (err) {
      console.error(`Failed to fetch balance for token ${token.symbol}:`, err);
    }
  }
  return balances;
}

export async function getNftHoldings(address: string) {
  const results: Array<{ nft: Erc721Token; tokenIds: string[] }> = [];
  for (const nft of ERC721_TOKENS) {
    try {
      const contract = new ethers.Contract(nft.address, ERC721_ABI, provider);
      const count: bigint = await contract.balanceOf(address);
      const ids: string[] = [];
      for (let i = 0n; i < count; i++) {
        try {
          const id: bigint = await contract.tokenOfOwnerByIndex(address, i);
          ids.push(id.toString());
        } catch {
          break;
        }
      }
      if (ids.length > 0) {
        results.push({ nft, tokenIds: ids });
      }
    } catch (err) {
      console.error(`Failed to fetch NFTs for contract ${nft.name}:`, err);
    }
  }
  return results;
}

const ERC20_DETECTION_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
];

export interface Erc20Info {
  name: string;
  symbol: string;
  decimals: number;
}

export async function getErc20Info(
  address: string,
): Promise<Erc20Info | null> {
  try {
    const contract = new ethers.Contract(address, ERC20_DETECTION_ABI, provider);
    const [name, symbol, decimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals(),
    ]);
    return { name, symbol, decimals };
  } catch {
    return null;
  }
}

// Function to get gas price
export async function getGasPrice() {
  try {
    const gasPrice = await provider.getFeeData();
    return gasPrice;
  } catch (error) {
    console.error("Error fetching gas price:", error);
    throw error;
  }
}

// Function to estimate gas for a transaction
export async function estimateGas(transaction: {
  from?: string;
  to?: string;
  value?: string;
  data?: string;
}) {
  try {
    return await provider.estimateGas(transaction);
  } catch (error) {
    console.error("Error estimating gas:", error);
    throw error;
  }
}

// Function to get logs with filters
export async function getLogs(filter: {
  fromBlock?: number | string;
  toBlock?: number | string;
  address?: string | string[];
  topics?: Array<string | string[] | null>;
}) {
  try {
    return await provider.getLogs(filter);
  } catch (error) {
    console.error("Error fetching logs:", error);
    throw error;
  }
}

// Function to get storage at a specific position
export async function getStorageAt(address: string, position: string, blockTag?: number | string) {
  try {
    return await provider.getStorage(address, position, blockTag);
  } catch (error) {
    console.error(`Error fetching storage for ${address} at position ${position}:`, error);
    throw error;
  }
}

// Function to get network information
export async function getNetworkInfo() {
  try {
    const network = await provider.getNetwork();
    return {
      name: network.name,
      chainId: Number(network.chainId),
      ensAddress: network.ensAddress
    };
  } catch (error) {
    console.error("Error fetching network info:", error);
    throw error;
  }
}

// Function to get block by hash
export async function getBlockByHash(blockHash: string, includeTransactions: boolean = false) {
  try {
    return await provider.getBlock(blockHash, includeTransactions);
  } catch (error) {
    console.error(`Error fetching block by hash ${blockHash}:`, error);
    throw error;
  }
}

// Function to make raw RPC calls
export async function makeRpcCall(method: string, params: any[] = []) {
  try {
    return await provider.send(method, params);
  } catch (error) {
    console.error(`Error making RPC call ${method}:`, error);
    throw error;
  }
}

// Function to get pending transactions (if supported by the RPC)
export async function getPendingTransactions() {
  try {
    return await makeRpcCall('txpool_content');
  } catch (error) {
    console.error("Error fetching pending transactions:", error);
    throw error;
  }
}

export async function isErc20Contract(address: string) {
  return (await getErc20Info(address)) !== null;
}

export { provider };
