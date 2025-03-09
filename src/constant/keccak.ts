import { ethers } from "ethers";

export interface HashData {
  input: string;
  type: string;
  description: string;
  hash: string;
}


export const commonData: HashData[] = [
  // ERC20 Functions
  {
    input: "transfer(address,uint256)",
    type: "Function Signature",
    description: "ERC20 Transfer Function",
    hash: ethers.keccak256(ethers.toUtf8Bytes("transfer(address,uint256)")).substring(0, 10)
  },
  {
    input: "approve(address,uint256)",
    type: "Function Signature",
    description: "ERC20 Approve Function",
    hash: ethers.keccak256(ethers.toUtf8Bytes("approve(address,uint256)")).substring(0, 10)
  },
  {
    input: "transferFrom(address,address,uint256)",
    type: "Function Signature",
    description: "ERC20 TransferFrom Function",
    hash: ethers.keccak256(ethers.toUtf8Bytes("transferFrom(address,address,uint256)")).substring(0, 10)
  },
  // ERC20 Events
  {
    input: "Transfer(address,address,uint256)",
    type: "Event Signature",
    description: "ERC20 Transfer Event",
    hash: ethers.keccak256(ethers.toUtf8Bytes("Transfer(address,address,uint256)"))
  },
  {
    input: "Approval(address,address,uint256)",
    type: "Event Signature",
    description: "ERC20 Approval Event",
    hash: ethers.keccak256(ethers.toUtf8Bytes("Approval(address,address,uint256)"))
  },
  // ERC721 Functions
  {
    input: "safeTransferFrom(address,address,uint256)",
    type: "Function Signature",
    description: "ERC721 Safe Transfer Function",
    hash: ethers.keccak256(ethers.toUtf8Bytes("safeTransferFrom(address,address,uint256)")).substring(0, 10)
  },
  {
    input: "mint(address,uint256)",
    type: "Function Signature",
    description: "ERC721 Mint Function",
    hash: ethers.keccak256(ethers.toUtf8Bytes("mint(address,uint256)")).substring(0, 10)
  },
  {
    input: "tokenURI(uint256)",
    type: "Function Signature",
    description: "ERC721 Token URI Query",
    hash: ethers.keccak256(ethers.toUtf8Bytes("tokenURI(uint256)")).substring(0, 10)
  },
  // ERC1155 Functions
  {
    input: "balanceOfBatch(address[],uint256[])",
    type: "Function Signature",
    description: "ERC1155 Batch Balance Query",
    hash: ethers.keccak256(ethers.toUtf8Bytes("balanceOfBatch(address[],uint256[])")).substring(0, 10)
  },
  {
    input: "safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)",
    type: "Function Signature",
    description: "ERC1155 Batch Transfer Function",
    hash: ethers.keccak256(ethers.toUtf8Bytes("safeBatchTransferFrom(address,address,uint256[],uint256[],bytes)")).substring(0, 10)
  },
  // Common Functions
  {
    input: "balanceOf(address)",
    type: "Function Signature",
    description: "ERC20/ERC721 Balance Query",
    hash: ethers.keccak256(ethers.toUtf8Bytes("balanceOf(address)")).substring(0, 10)
  },
  {
    input: "owner()",
    type: "Function Signature",
    description: "Owner Query",
    hash: ethers.keccak256(ethers.toUtf8Bytes("owner()")).substring(0, 10)
  },
  // Governance Functions
  {
    input: "propose(address[],uint256[],string[],bytes[],string)",
    type: "Function Signature",
    description: "Governance Propose Function",
    hash: ethers.keccak256(ethers.toUtf8Bytes("propose(address[],uint256[],string[],bytes[],string)")).substring(0, 10)
  },
  {
    input: "castVote(uint256,uint8)",
    type: "Function Signature",
    description: "Governance Vote Function",
    hash: ethers.keccak256(ethers.toUtf8Bytes("castVote(uint256,uint8)")).substring(0, 10)
  },
  // DeFi Functions
  {
    input: "swap(uint256,uint256,address,bytes)",
    type: "Function Signature",
    description: "DeFi Swap Function",
    hash: ethers.keccak256(ethers.toUtf8Bytes("swap(uint256,uint256,address,bytes)")).substring(0, 10)
  },
  {
    input: "deposit()",
    type: "Function Signature",
    description: "DeFi Deposit Function",
    hash: ethers.keccak256(ethers.toUtf8Bytes("deposit()")).substring(0, 10)
  },
  {
    input: "withdraw(uint256)",
    type: "Function Signature",
    description: "DeFi Withdraw Function",
    hash: ethers.keccak256(ethers.toUtf8Bytes("withdraw(uint256)")).substring(0, 10)
  },
];
