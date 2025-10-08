/**
 * Web3 Utility Module
 * 
 * This module provides comprehensive Web3 functionalities for blockchain interactions.
 * It supports multiple wallet providers, transaction handling, network management,
 * and common Web3 operations with strong TypeScript typing.
 * 
 * @module web3
 * @author BlockView Contributors
 * 
 * @example Basic Usage
 * ```typescript
 * import { connectWallet, getWalletBalance, switchNetwork } from '@/utils/web3';
 * 
 * // Connect to wallet
 * const { address, provider } = await connectWallet();
 * 
 * // Get balance
 * const balance = await getWalletBalance(address);
 * 
 * // Switch network
 * await switchNetwork(1); // Switch to Ethereum Mainnet
 * ```
 */

import { ethers, BrowserProvider, JsonRpcProvider, Eip1193Provider } from 'ethers';

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Supported wallet provider types
 */
export enum WalletProvider {
  METAMASK = 'metamask',
  OKX = 'okx',
  COINBASE = 'coinbase',
  WALLETCONNECT = 'walletconnect',
  GENERIC = 'generic',
}

/**
 * Wallet connection result
 */
export interface WalletConnection {
  address: string;
  provider: BrowserProvider;
  chainId: number;
  providerType: WalletProvider;
}

/**
 * Network configuration
 */
export interface NetworkConfig {
  chainId: number;
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
}

/**
 * Transaction parameters
 */
export interface TransactionParams {
  to: string;
  value?: string;
  data?: string;
  gasLimit?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
}

/**
 * Transaction receipt with additional info
 */
export interface TransactionReceipt {
  hash: string;
  from: string;
  to: string | null;
  blockNumber: number;
  gasUsed: bigint;
  status: number;
  logs: any[];
}

/**
 * Gas estimation result
 */
export interface GasEstimation {
  gasLimit: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  estimatedCost: string; // in ETH
}

/**
 * Balance information
 */
export interface BalanceInfo {
  balance: string; // in ETH
  balanceWei: bigint;
  formattedBalance: string;
}

/**
 * Web3 error with additional context
 */
export class Web3Error extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'Web3Error';
  }
}

// ============================================================================
// Wallet Connection & Management
// ============================================================================

/**
 * Detects available wallet providers in the browser
 * 
 * @returns Array of available wallet provider types
 * 
 * @example
 * ```typescript
 * const providers = detectWalletProviders();
 * console.log('Available wallets:', providers);
 * ```
 */
export function detectWalletProviders(): WalletProvider[] {
  const providers: WalletProvider[] = [];
  const win = window as any;

  if (win.ethereum?.isMetaMask) {
    providers.push(WalletProvider.METAMASK);
  }
  if (win.okxwallet) {
    providers.push(WalletProvider.OKX);
  }
  if (win.ethereum?.isCoinbaseWallet) {
    providers.push(WalletProvider.COINBASE);
  }
  if (win.ethereum && !win.ethereum.isMetaMask && !win.ethereum.isCoinbaseWallet) {
    providers.push(WalletProvider.GENERIC);
  }

  return providers;
}

/**
 * Gets the appropriate provider instance based on preference
 * 
 * @param preferredProvider - Preferred wallet provider type
 * @returns Ethereum provider instance or null
 */
export function getProvider(preferredProvider?: WalletProvider): Eip1193Provider | null {
  const win = window as any;

  if (preferredProvider === WalletProvider.OKX && win.okxwallet) {
    return win.okxwallet;
  }
  if (preferredProvider === WalletProvider.METAMASK && win.ethereum?.isMetaMask) {
    return win.ethereum;
  }
  if (preferredProvider === WalletProvider.COINBASE && win.ethereum?.isCoinbaseWallet) {
    return win.ethereum;
  }

  // Fallback to any available provider
  return win.ethereum || win.okxwallet || null;
}

/**
 * Connects to a wallet provider and returns connection details
 * 
 * @param preferredProvider - Optional preferred wallet provider
 * @returns Promise resolving to wallet connection details
 * @throws {Web3Error} If no provider found or connection fails
 * 
 * @example
 * ```typescript
 * try {
 *   const connection = await connectWallet(WalletProvider.METAMASK);
 *   console.log('Connected to:', connection.address);
 * } catch (error) {
 *   console.error('Connection failed:', error);
 * }
 * ```
 */
export async function connectWallet(
  preferredProvider?: WalletProvider
): Promise<WalletConnection> {
  try {
    const ethProvider = getProvider(preferredProvider);
    
    if (!ethProvider) {
      throw new Web3Error(
        'No wallet provider found. Please install MetaMask or another Web3 wallet.',
        'NO_PROVIDER'
      );
    }

    // Request account access
    const accounts = await ethProvider.request({
      method: 'eth_requestAccounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Web3Error('No accounts found', 'NO_ACCOUNTS');
    }

    const provider = new BrowserProvider(ethProvider);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);

    // Determine provider type
    let providerType = WalletProvider.GENERIC;
    const win = window as any;
    if (win.ethereum?.isMetaMask) {
      providerType = WalletProvider.METAMASK;
    } else if (win.okxwallet) {
      providerType = WalletProvider.OKX;
    } else if (win.ethereum?.isCoinbaseWallet) {
      providerType = WalletProvider.COINBASE;
    }

    return {
      address: accounts[0],
      provider,
      chainId,
      providerType,
    };
  } catch (error: any) {
    if (error instanceof Web3Error) {
      throw error;
    }
    throw new Web3Error(
      'Failed to connect wallet',
      error.code || 'CONNECTION_FAILED',
      error
    );
  }
}

/**
 * Disconnects the current wallet (clears local state)
 * Note: This doesn't actually disconnect from the provider, just clears app state
 * 
 * @example
 * ```typescript
 * disconnectWallet();
 * ```
 */
export function disconnectWallet(): void {
  // Clear any cached wallet data from localStorage
  localStorage.removeItem('wallet_address');
  localStorage.removeItem('wallet_provider');
}

/**
 * Checks if a wallet is currently connected
 * 
 * @returns Promise resolving to connection status
 */
export async function isWalletConnected(): Promise<boolean> {
  try {
    const ethProvider = getProvider();
    if (!ethProvider) return false;

    const accounts = await ethProvider.request({
      method: 'eth_accounts',
    }) as string[];

    return accounts && accounts.length > 0;
  } catch {
    return false;
  }
}

// ============================================================================
// Network Management
// ============================================================================

/**
 * Gets the current network chain ID
 * 
 * @param provider - Optional provider instance
 * @returns Promise resolving to chain ID
 * @throws {Web3Error} If unable to get chain ID
 */
export async function getCurrentChainId(provider?: BrowserProvider): Promise<number> {
  try {
    if (!provider) {
      const ethProvider = getProvider();
      if (!ethProvider) {
        throw new Web3Error('No provider available', 'NO_PROVIDER');
      }
      provider = new BrowserProvider(ethProvider);
    }

    const network = await provider.getNetwork();
    return Number(network.chainId);
  } catch (error: any) {
    throw new Web3Error(
      'Failed to get chain ID',
      'CHAIN_ID_ERROR',
      error
    );
  }
}

/**
 * Switches the wallet to a different network
 * 
 * @param chainId - Target chain ID
 * @param networkConfig - Optional network configuration for adding network
 * @returns Promise resolving when switch is complete
 * @throws {Web3Error} If switch fails
 * 
 * @example
 * ```typescript
 * // Switch to Ethereum Mainnet
 * await switchNetwork(1);
 * 
 * // Switch to BSC with config (adds if not exists)
 * await switchNetwork(56, {
 *   chainId: 56,
 *   chainName: 'BNB Smart Chain',
 *   nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
 *   rpcUrls: ['https://bsc-dataseed.binance.org'],
 *   blockExplorerUrls: ['https://bscscan.com']
 * });
 * ```
 */
export async function switchNetwork(
  chainId: number,
  networkConfig?: NetworkConfig
): Promise<void> {
  try {
    const ethProvider = getProvider();
    if (!ethProvider) {
      throw new Web3Error('No provider available', 'NO_PROVIDER');
    }

    const chainIdHex = `0x${chainId.toString(16)}`;

    try {
      await ethProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to the wallet
      if (switchError.code === 4902 && networkConfig) {
        await addNetwork(networkConfig);
      } else {
        throw switchError;
      }
    }
  } catch (error: any) {
    throw new Web3Error(
      `Failed to switch to network ${chainId}`,
      error.code || 'SWITCH_NETWORK_FAILED',
      error
    );
  }
}

/**
 * Adds a new network to the wallet
 * 
 * @param config - Network configuration
 * @returns Promise resolving when network is added
 * @throws {Web3Error} If addition fails
 */
export async function addNetwork(config: NetworkConfig): Promise<void> {
  try {
    const ethProvider = getProvider();
    if (!ethProvider) {
      throw new Web3Error('No provider available', 'NO_PROVIDER');
    }

    await ethProvider.request({
      method: 'wallet_addEthereumChain',
      params: [
        {
          chainId: `0x${config.chainId.toString(16)}`,
          chainName: config.chainName,
          nativeCurrency: config.nativeCurrency,
          rpcUrls: config.rpcUrls,
          blockExplorerUrls: config.blockExplorerUrls || [],
        },
      ],
    });
  } catch (error: any) {
    throw new Web3Error(
      'Failed to add network',
      error.code || 'ADD_NETWORK_FAILED',
      error
    );
  }
}

// ============================================================================
// Balance & Account Information
// ============================================================================

/**
 * Gets the balance of an address
 * 
 * @param address - Ethereum address
 * @param provider - Optional provider instance
 * @returns Promise resolving to balance information
 * @throws {Web3Error} If balance retrieval fails
 * 
 * @example
 * ```typescript
 * const balanceInfo = await getWalletBalance('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
 * console.log(`Balance: ${balanceInfo.formattedBalance}`);
 * ```
 */
export async function getWalletBalance(
  address: string,
  provider?: BrowserProvider | JsonRpcProvider
): Promise<BalanceInfo> {
  try {
    if (!ethers.isAddress(address)) {
      throw new Web3Error('Invalid Ethereum address', 'INVALID_ADDRESS');
    }

    if (!provider) {
      const ethProvider = getProvider();
      if (!ethProvider) {
        throw new Web3Error('No provider available', 'NO_PROVIDER');
      }
      provider = new BrowserProvider(ethProvider);
    }

    const balanceWei = await provider.getBalance(address);
    const balance = ethers.formatEther(balanceWei);
    const formattedBalance = `${parseFloat(balance).toFixed(6)} ETH`;

    return {
      balance,
      balanceWei,
      formattedBalance,
    };
  } catch (error: any) {
    if (error instanceof Web3Error) {
      throw error;
    }
    throw new Web3Error(
      'Failed to get balance',
      'BALANCE_ERROR',
      error
    );
  }
}

/**
 * Gets the transaction count (nonce) for an address
 * 
 * @param address - Ethereum address
 * @param provider - Optional provider instance
 * @returns Promise resolving to transaction count
 * @throws {Web3Error} If retrieval fails
 */
export async function getTransactionCount(
  address: string,
  provider?: BrowserProvider | JsonRpcProvider
): Promise<number> {
  try {
    if (!ethers.isAddress(address)) {
      throw new Web3Error('Invalid Ethereum address', 'INVALID_ADDRESS');
    }

    if (!provider) {
      const ethProvider = getProvider();
      if (!ethProvider) {
        throw new Web3Error('No provider available', 'NO_PROVIDER');
      }
      provider = new BrowserProvider(ethProvider);
    }

    return await provider.getTransactionCount(address);
  } catch (error: any) {
    if (error instanceof Web3Error) {
      throw error;
    }
    throw new Web3Error(
      'Failed to get transaction count',
      'TRANSACTION_COUNT_ERROR',
      error
    );
  }
}

// ============================================================================
// Transaction Handling
// ============================================================================

/**
 * Estimates gas for a transaction
 * 
 * @param transaction - Transaction parameters
 * @param provider - Optional provider instance
 * @returns Promise resolving to gas estimation
 * @throws {Web3Error} If estimation fails
 * 
 * @example
 * ```typescript
 * const gasEstimate = await estimateTransactionGas({
 *   to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   value: ethers.parseEther('0.1').toString()
 * });
 * console.log(`Estimated cost: ${gasEstimate.estimatedCost}`);
 * ```
 */
export async function estimateTransactionGas(
  transaction: TransactionParams,
  provider?: BrowserProvider
): Promise<GasEstimation> {
  try {
    if (!provider) {
      const ethProvider = getProvider();
      if (!ethProvider) {
        throw new Web3Error('No provider available', 'NO_PROVIDER');
      }
      provider = new BrowserProvider(ethProvider);
    }

    // Estimate gas limit
    const gasLimit = await provider.estimateGas({
      to: transaction.to,
      value: transaction.value ? BigInt(transaction.value) : undefined,
      data: transaction.data || '0x',
    });

    // Get current gas prices
    const feeData = await provider.getFeeData();
    const maxFeePerGas = feeData.maxFeePerGas || BigInt(0);
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || BigInt(0);

    // Calculate estimated cost
    const estimatedCostWei = gasLimit * maxFeePerGas;
    const estimatedCost = ethers.formatEther(estimatedCostWei);

    return {
      gasLimit,
      maxFeePerGas,
      maxPriorityFeePerGas,
      estimatedCost,
    };
  } catch (error: any) {
    throw new Web3Error(
      'Failed to estimate gas',
      'GAS_ESTIMATION_ERROR',
      error
    );
  }
}

/**
 * Sends a transaction
 * 
 * @param transaction - Transaction parameters
 * @param provider - Optional provider instance
 * @returns Promise resolving to transaction hash
 * @throws {Web3Error} If transaction fails
 * 
 * @example
 * ```typescript
 * const txHash = await sendTransaction({
 *   to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
 *   value: ethers.parseEther('0.1').toString()
 * });
 * console.log('Transaction sent:', txHash);
 * ```
 */
export async function sendTransaction(
  transaction: TransactionParams,
  provider?: BrowserProvider
): Promise<string> {
  try {
    if (!provider) {
      const ethProvider = getProvider();
      if (!ethProvider) {
        throw new Web3Error('No provider available', 'NO_PROVIDER');
      }
      provider = new BrowserProvider(ethProvider);
    }

    const signer = await provider.getSigner();
    
    const tx = await signer.sendTransaction({
      to: transaction.to,
      value: transaction.value ? BigInt(transaction.value) : undefined,
      data: transaction.data || '0x',
      gasLimit: transaction.gasLimit ? BigInt(transaction.gasLimit) : undefined,
      maxFeePerGas: transaction.maxFeePerGas ? BigInt(transaction.maxFeePerGas) : undefined,
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas
        ? BigInt(transaction.maxPriorityFeePerGas)
        : undefined,
    });

    return tx.hash;
  } catch (error: any) {
    if (error.code === 'ACTION_REJECTED') {
      throw new Web3Error('Transaction rejected by user', 'USER_REJECTED', error);
    }
    throw new Web3Error(
      'Failed to send transaction',
      error.code || 'TRANSACTION_FAILED',
      error
    );
  }
}

/**
 * Waits for a transaction to be mined and returns the receipt
 * 
 * @param txHash - Transaction hash
 * @param provider - Optional provider instance
 * @param confirmations - Number of confirmations to wait for (default: 1)
 * @returns Promise resolving to transaction receipt
 * @throws {Web3Error} If transaction fails or times out
 * 
 * @example
 * ```typescript
 * const receipt = await waitForTransaction(txHash);
 * if (receipt.status === 1) {
 *   console.log('Transaction successful!');
 * }
 * ```
 */
export async function waitForTransaction(
  txHash: string,
  provider?: BrowserProvider | JsonRpcProvider,
  confirmations: number = 1
): Promise<TransactionReceipt> {
  try {
    if (!provider) {
      const ethProvider = getProvider();
      if (!ethProvider) {
        throw new Web3Error('No provider available', 'NO_PROVIDER');
      }
      provider = new BrowserProvider(ethProvider);
    }

    const receipt = await provider.waitForTransaction(txHash, confirmations);
    
    if (!receipt) {
      throw new Web3Error('Transaction receipt not found', 'RECEIPT_NOT_FOUND');
    }

    return {
      hash: receipt.hash,
      from: receipt.from,
      to: receipt.to,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed,
      status: receipt.status || 0,
      logs: receipt.logs,
    };
  } catch (error: any) {
    throw new Web3Error(
      'Failed to wait for transaction',
      'WAIT_TRANSACTION_ERROR',
      error
    );
  }
}

/**
 * Signs a message with the connected wallet
 * 
 * @param message - Message to sign
 * @param provider - Optional provider instance
 * @returns Promise resolving to signature
 * @throws {Web3Error} If signing fails
 * 
 * @example
 * ```typescript
 * const signature = await signMessage('Hello, Web3!');
 * console.log('Signature:', signature);
 * ```
 */
export async function signMessage(
  message: string,
  provider?: BrowserProvider
): Promise<string> {
  try {
    if (!provider) {
      const ethProvider = getProvider();
      if (!ethProvider) {
        throw new Web3Error('No provider available', 'NO_PROVIDER');
      }
      provider = new BrowserProvider(ethProvider);
    }

    const signer = await provider.getSigner();
    return await signer.signMessage(message);
  } catch (error: any) {
    if (error.code === 'ACTION_REJECTED') {
      throw new Web3Error('Signature rejected by user', 'USER_REJECTED', error);
    }
    throw new Web3Error(
      'Failed to sign message',
      error.code || 'SIGN_MESSAGE_FAILED',
      error
    );
  }
}

/**
 * Verifies a signed message
 * 
 * @param message - Original message
 * @param signature - Signature to verify
 * @returns Address that signed the message
 * @throws {Web3Error} If verification fails
 * 
 * @example
 * ```typescript
 * const signer = verifySignature('Hello, Web3!', signature);
 * console.log('Signed by:', signer);
 * ```
 */
export function verifySignature(message: string, signature: string): string {
  try {
    return ethers.verifyMessage(message, signature);
  } catch (error: any) {
    throw new Web3Error(
      'Failed to verify signature',
      'VERIFY_SIGNATURE_FAILED',
      error
    );
  }
}

// ============================================================================
// Contract Interactions
// ============================================================================

/**
 * Checks if an address is a smart contract
 * 
 * @param address - Ethereum address
 * @param provider - Optional provider instance
 * @returns Promise resolving to true if address is a contract
 * @throws {Web3Error} If check fails
 * 
 * @example
 * ```typescript
 * const isContract = await isContractAddress('0x...');
 * console.log('Is contract:', isContract);
 * ```
 */
export async function isContractAddress(
  address: string,
  provider?: BrowserProvider | JsonRpcProvider
): Promise<boolean> {
  try {
    if (!ethers.isAddress(address)) {
      throw new Web3Error('Invalid Ethereum address', 'INVALID_ADDRESS');
    }

    if (!provider) {
      const ethProvider = getProvider();
      if (!ethProvider) {
        throw new Web3Error('No provider available', 'NO_PROVIDER');
      }
      provider = new BrowserProvider(ethProvider);
    }

    const code = await provider.getCode(address);
    return code !== '0x';
  } catch (error: any) {
    if (error instanceof Web3Error) {
      throw error;
    }
    throw new Web3Error(
      'Failed to check contract address',
      'CONTRACT_CHECK_ERROR',
      error
    );
  }
}

/**
 * Reads data from a smart contract
 * 
 * @param contractAddress - Contract address
 * @param abi - Contract ABI
 * @param method - Method name to call
 * @param params - Method parameters
 * @param provider - Optional provider instance
 * @returns Promise resolving to method result
 * @throws {Web3Error} If call fails
 * 
 * @example
 * ```typescript
 * const balance = await callContractMethod(
 *   tokenAddress,
 *   ['function balanceOf(address) view returns (uint256)'],
 *   'balanceOf',
 *   [walletAddress]
 * );
 * ```
 */
export async function callContractMethod(
  contractAddress: string,
  abi: string[],
  method: string,
  params: any[] = [],
  provider?: BrowserProvider | JsonRpcProvider
): Promise<any> {
  try {
    if (!ethers.isAddress(contractAddress)) {
      throw new Web3Error('Invalid contract address', 'INVALID_ADDRESS');
    }

    if (!provider) {
      const ethProvider = getProvider();
      if (!ethProvider) {
        throw new Web3Error('No provider available', 'NO_PROVIDER');
      }
      provider = new BrowserProvider(ethProvider);
    }

    const contract = new ethers.Contract(contractAddress, abi, provider);
    return await contract[method](...params);
  } catch (error: any) {
    throw new Web3Error(
      `Failed to call contract method: ${method}`,
      'CONTRACT_CALL_ERROR',
      error
    );
  }
}

/**
 * Sends a transaction to a smart contract method
 * 
 * @param contractAddress - Contract address
 * @param abi - Contract ABI
 * @param method - Method name to call
 * @param params - Method parameters
 * @param provider - Optional provider instance
 * @returns Promise resolving to transaction hash
 * @throws {Web3Error} If transaction fails
 * 
 * @example
 * ```typescript
 * const txHash = await sendContractTransaction(
 *   tokenAddress,
 *   ['function transfer(address to, uint256 amount) returns (bool)'],
 *   'transfer',
 *   [recipientAddress, ethers.parseUnits('100', 18)]
 * );
 * ```
 */
export async function sendContractTransaction(
  contractAddress: string,
  abi: string[],
  method: string,
  params: any[] = [],
  provider?: BrowserProvider
): Promise<string> {
  try {
    if (!ethers.isAddress(contractAddress)) {
      throw new Web3Error('Invalid contract address', 'INVALID_ADDRESS');
    }

    if (!provider) {
      const ethProvider = getProvider();
      if (!ethProvider) {
        throw new Web3Error('No provider available', 'NO_PROVIDER');
      }
      provider = new BrowserProvider(ethProvider);
    }

    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    
    const tx = await contract[method](...params);
    return tx.hash;
  } catch (error: any) {
    if (error.code === 'ACTION_REJECTED') {
      throw new Web3Error('Transaction rejected by user', 'USER_REJECTED', error);
    }
    throw new Web3Error(
      `Failed to send contract transaction: ${method}`,
      error.code || 'CONTRACT_TRANSACTION_ERROR',
      error
    );
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validates an Ethereum address
 * 
 * @param address - Address to validate
 * @returns True if address is valid
 * 
 * @example
 * ```typescript
 * if (isValidAddress('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb')) {
 *   console.log('Valid address');
 * }
 * ```
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Converts an amount from Wei to Ether
 * 
 * @param wei - Amount in Wei
 * @returns Amount in Ether as string
 * 
 * @example
 * ```typescript
 * const eth = weiToEth('1000000000000000000'); // '1.0'
 * ```
 */
export function weiToEth(wei: string | bigint): string {
  return ethers.formatEther(wei);
}

/**
 * Converts an amount from Ether to Wei
 * 
 * @param eth - Amount in Ether
 * @returns Amount in Wei as bigint
 * 
 * @example
 * ```typescript
 * const wei = ethToWei('1.0'); // 1000000000000000000n
 * ```
 */
export function ethToWei(eth: string): bigint {
  return ethers.parseEther(eth);
}

/**
 * Formats an Ethereum address for display
 * 
 * @param address - Full address
 * @param prefixLength - Number of characters to show at start (default: 6)
 * @param suffixLength - Number of characters to show at end (default: 4)
 * @returns Formatted address
 * 
 * @example
 * ```typescript
 * const short = formatAddressShort('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
 * // Returns: '0x742d...0bEb'
 * ```
 */
export function formatAddressShort(
  address: string,
  prefixLength: number = 6,
  suffixLength: number = 4
): string {
  if (!address || address.length < prefixLength + suffixLength) {
    return address;
  }
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
}

/**
 * Formats a transaction hash for display
 * 
 * @param hash - Transaction hash
 * @returns Formatted hash
 * 
 * @example
 * ```typescript
 * const short = formatTxHash('0x1234...7890');
 * ```
 */
export function formatTxHash(hash: string): string {
  return formatAddressShort(hash, 8, 6);
}

/**
 * Gets a human-readable error message from a Web3 error
 * 
 * @param error - Error object
 * @returns User-friendly error message
 * 
 * @example
 * ```typescript
 * try {
 *   await sendTransaction(...);
 * } catch (error) {
 *   console.error(getErrorMessage(error));
 * }
 * ```
 */
export function getErrorMessage(error: any): string {
  if (error instanceof Web3Error) {
    return error.message;
  }

  if (error.code === 'ACTION_REJECTED') {
    return 'Transaction rejected by user';
  }

  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds for transaction';
  }

  if (error.code === 'NETWORK_ERROR') {
    return 'Network connection error';
  }

  if (error.code === 'INVALID_ARGUMENT') {
    return 'Invalid transaction parameters';
  }

  if (error.message) {
    return error.message;
  }

  return 'An unknown error occurred';
}

// ============================================================================
// Event Listeners
// ============================================================================

/**
 * Sets up event listeners for wallet events
 * 
 * @param callbacks - Event callbacks
 * @returns Cleanup function to remove listeners
 * 
 * @example
 * ```typescript
 * const cleanup = setupWalletEventListeners({
 *   onAccountsChanged: (accounts) => console.log('Accounts:', accounts),
 *   onChainChanged: (chainId) => console.log('Chain:', chainId),
 *   onDisconnect: () => console.log('Disconnected')
 * });
 * 
 * // Later, cleanup when component unmounts
 * cleanup();
 * ```
 */
export function setupWalletEventListeners(callbacks: {
  onAccountsChanged?: (accounts: string[]) => void;
  onChainChanged?: (chainId: string) => void;
  onDisconnect?: () => void;
}): () => void {
  const ethProvider = getProvider();
  
  if (!ethProvider) {
    return () => {};
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (callbacks.onAccountsChanged) {
      callbacks.onAccountsChanged(accounts);
    }
  };

  const handleChainChanged = (chainId: string) => {
    if (callbacks.onChainChanged) {
      callbacks.onChainChanged(chainId);
    }
  };

  const handleDisconnect = () => {
    if (callbacks.onDisconnect) {
      callbacks.onDisconnect();
    }
  };

  ethProvider.on?.('accountsChanged', handleAccountsChanged);
  ethProvider.on?.('chainChanged', handleChainChanged);
  ethProvider.on?.('disconnect', handleDisconnect);

  // Return cleanup function
  return () => {
    ethProvider.removeListener?.('accountsChanged', handleAccountsChanged);
    ethProvider.removeListener?.('chainChanged', handleChainChanged);
    ethProvider.removeListener?.('disconnect', handleDisconnect);
  };
}

// ============================================================================
// Exports
// ============================================================================

export default {
  // Wallet
  detectWalletProviders,
  getProvider,
  connectWallet,
  disconnectWallet,
  isWalletConnected,

  // Network
  getCurrentChainId,
  switchNetwork,
  addNetwork,

  // Balance & Account
  getWalletBalance,
  getTransactionCount,

  // Transactions
  estimateTransactionGas,
  sendTransaction,
  waitForTransaction,
  signMessage,
  verifySignature,

  // Contracts
  isContractAddress,
  callContractMethod,
  sendContractTransaction,

  // Utilities
  isValidAddress,
  weiToEth,
  ethToWei,
  formatAddressShort,
  formatTxHash,
  getErrorMessage,
  setupWalletEventListeners,
};
