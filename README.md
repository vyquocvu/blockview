# BlockView

BlockView is a lightweight blockchain explorer built with React, TypeScript and Vite. It connects to any EVM compatible RPC endpoint and shows information about blocks, transactions and accounts.

## Installation

This project uses **Yarn** with Plug'n'Play for dependency management. Install packages with:

```bash
yarn install
```

## Development

Start a local dev server after installing dependencies:

```bash
yarn dev
```

The app will open in your browser with hot module reloading.

## Features

- Browse recent blocks with auto‑refresh and view detailed information for a selected block.
- Inspect individual transactions including decoded data and logs.
- View address details and a profile page showing ERC‑20 token balances and NFT holdings.
- Helper tools such as a unit converter, block time converter and Keccak‑256 hash table.
- **Change RPC** dialog to switch networks on the fly.
- **Connect Wallet** button for quickly linking your browser wallet.

Visit `/blocks`, `/tx/<hash>`, `/address/<addr>` or `/profile/<addr>` via the hash based router to explore the chain data.

