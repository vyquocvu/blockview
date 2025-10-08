# BlockView

BlockView is a comprehensive blockchain explorer built with React, TypeScript and Vite. It connects to any EVM compatible RPC endpoint and provides detailed information about blocks, transactions, accounts, tokens, and network activity.

## Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **Blockchain**: Ethers.js v6 for Web3 interactions
- **UI Components**: Radix UI primitives
- **Package Manager**: Yarn with Plug'n'Play (or npm as fallback)

## Installation

This project uses **Yarn** with Plug'n'Play for dependency management. Install packages with:

```bash
yarn install
```

Alternatively, if you encounter issues with Yarn, you can use npm:

```bash
npm install
```

## Development

Start a local dev server after installing dependencies:

```bash
yarn dev
# or
npm run dev
```

The app will open in your browser at `http://localhost:5173` with hot module reloading.

## Build

Build the project for production:

```bash
yarn build
# or  
npm run build
```

## Features

### 🔍 Blockchain Exploration
- **Block Browser**: Browse recent blocks with auto-refresh and view detailed information for any block
- **Transaction Inspector**: Inspect individual transactions including decoded data, logs, and gas usage
- **Address Details**: View comprehensive address information including balance and transaction history
- **Token Explorer**: Browse ERC-20 tokens with detailed token information and balances

### 📊 Real-time Network Data
- **Gas Tracker**: Real-time gas price monitoring with standard, max fee, and priority fee information
- **Network Info**: Current network status, chain ID, and connection details
- **Block Counter**: Live block number updates

### 🔧 Developer Tools
- **RPC Interface**: Direct RPC calls to the connected blockchain node with pre-configured common methods
- **Event Log Filter**: Query and filter blockchain event logs by block range, address, and topics
- **Unit Converter**: Convert between Wei, Gwei, and Ether
- **Block Time Converter**: Convert block numbers to timestamps and vice versa
- **Gas Estimator**: Estimate gas costs for transactions
- **Keccak-256 Hash Table**: Generate Keccak-256 hashes for any input

### 🌐 Network Management
- **Multi-Network Support**: Pre-configured support for Ethereum Mainnet, BNB Smart Chain, and Viction
- **Custom RPC**: Easy RPC endpoint switching through the network dialog
- **Wallet Integration**: Connect your browser wallet (MetaMask, etc.) for enhanced functionality

### 🧭 Navigation & User Experience
- **Hash-based Routing**: Clean URLs for all pages and resources
- **Search Functionality**: Universal search for blocks, transactions, addresses, and tokens
- **Profile Pages**: Personalized views showing your token balances and NFT holdings when wallet is connected
- **Responsive Design**: Optimized for desktop and mobile devices

## Routing

The application uses hash-based routing. Access different features via:

- `/blocks` - Block explorer (default)
- `/block/<number>` - Specific block details
- `/tx/<hash>` - Transaction details
- `/address/<address>` - Address information
- `/profile/<address>` - Profile page with token balances
- `/tokens` - Token explorer
- `/token/<address>` - Token details
- `/transactions` - Transaction history
- `/accounts` - Account management
- `/logs` - Event log filter
- `/rpc` - RPC interface
- `/tools` - Web3 & Helper Tools (unit converter, gas estimator, wallet operations, etc.)
- `/keccak` - Keccak-256 hash generator

## Web3 Utility Module

BlockView includes a comprehensive Web3 utility module (`src/utils/web3.ts`) that provides reusable functions for common Web3 operations. This module is designed to be modular, maintainable, and easily extensible.

### Features

The Web3 utility module provides:

- **Wallet Connection & Management**: Connect to multiple wallet providers (MetaMask, OKX, Coinbase, etc.)
- **Network Switching**: Easily switch between networks or add new networks
- **Transaction Handling**: Send transactions, estimate gas, wait for confirmations, and sign messages
- **Balance Queries**: Retrieve account balances and transaction counts
- **Contract Interactions**: Read from and write to smart contracts
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Type Safety**: Full TypeScript support with detailed type definitions
- **Event Listeners**: Listen to wallet events (account changes, network changes, disconnects)

### Usage Examples

#### Connect to Wallet

```typescript
import { connectWallet, WalletProvider } from '@/utils/web3';

try {
  const connection = await connectWallet(WalletProvider.METAMASK);
  console.log('Connected address:', connection.address);
  console.log('Chain ID:', connection.chainId);
} catch (error) {
  console.error('Connection failed:', error);
}
```

#### Get Balance

```typescript
import { getWalletBalance } from '@/utils/web3';

const balanceInfo = await getWalletBalance('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
console.log('Balance:', balanceInfo.formattedBalance);
```

#### Send Transaction

```typescript
import { sendTransaction, waitForTransaction } from '@/utils/web3';
import { ethers } from 'ethers';

// Send ETH
const txHash = await sendTransaction({
  to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  value: ethers.parseEther('0.1').toString()
});

// Wait for confirmation
const receipt = await waitForTransaction(txHash);
console.log('Transaction successful:', receipt.status === 1);
```

#### Switch Network

```typescript
import { switchNetwork } from '@/utils/web3';

// Switch to Ethereum Mainnet
await switchNetwork(1);

// Or add a custom network
await switchNetwork(56, {
  chainId: 56,
  chainName: 'BNB Smart Chain',
  nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
  rpcUrls: ['https://bsc-dataseed.binance.org'],
  blockExplorerUrls: ['https://bscscan.com']
});
```

#### Interact with Smart Contracts

```typescript
import { callContractMethod, sendContractTransaction } from '@/utils/web3';

// Read from contract
const balance = await callContractMethod(
  tokenAddress,
  ['function balanceOf(address) view returns (uint256)'],
  'balanceOf',
  [walletAddress]
);

// Write to contract
const txHash = await sendContractTransaction(
  tokenAddress,
  ['function transfer(address to, uint256 amount) returns (bool)'],
  'transfer',
  [recipientAddress, ethers.parseUnits('100', 18)]
);
```

#### Listen to Wallet Events

```typescript
import { setupWalletEventListeners } from '@/utils/web3';

const cleanup = setupWalletEventListeners({
  onAccountsChanged: (accounts) => {
    console.log('Account changed:', accounts[0]);
  },
  onChainChanged: (chainId) => {
    console.log('Network changed:', chainId);
    window.location.reload(); // Recommended by MetaMask
  },
  onDisconnect: () => {
    console.log('Wallet disconnected');
  }
});

// Clean up listeners when component unmounts
return () => cleanup();
```

### API Documentation

For detailed API documentation, type definitions, and more examples, see the inline documentation in `src/utils/web3.ts`.

### Interactive Tools Interface

A unified tools interface is available at `/tools` route (accessible via `#/tools` or through the "Tools" link in the navigation). This interface provides:

**Web3 Operations:**
- Wallet connections with different providers
- Account balance checking
- Network switching
- Gas estimation and transaction sending
- Message signing and verification

**Helper Tools:**
- Unit converter (Wei, Gwei, Ether)
- Block time converter
- Gas estimator

The tools interface is organized in tabs for easy navigation and is located at `src/components/Web3Tools.tsx`.

## Getting Started

1. Install dependencies
2. Start the development server
3. Configure your RPC endpoint using the "Change RPC" button in the header
4. Optionally connect your wallet for enhanced features
5. Explore blocks, transactions, and addresses on your chosen network

