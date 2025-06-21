export interface Erc20Token {
  address: string;
  symbol: string;
  decimals: number;
}

export interface Erc721Token {
  address: string;
  name: string;
}

export const ERC20_TOKENS: Erc20Token[] = [
  {
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // USDT on Ethereum
    symbol: "USDT",
    decimals: 6,
  },
  {
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eb48", // USDC on Ethereum
    symbol: "USDC",
    decimals: 6,
  },
];

export const ERC721_TOKENS: Erc721Token[] = [
  {
    address: "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85", // ENS NFT
    name: "ENS",
  },
];
