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
- `/helper` - Developer tools (unit converter, gas estimator, etc.)
- `/keccak` - Keccak-256 hash generator

## Getting Started

1. Install dependencies
2. Start the development server
3. Configure your RPC endpoint using the "Change RPC" button in the header
4. Optionally connect your wallet for enhanced features
5. Explore blocks, transactions, and addresses on your chosen network

