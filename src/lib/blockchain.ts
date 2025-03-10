import { ethers } from "ethers";

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

// Function to format address for display
export function formatAddress(address: string) {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Function to format timestamp to date
export function formatTimestamp(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString();
}

export { provider };