import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { ethers } from "ethers";

interface HashData {
  input: string;
  type: string;
  description: string;
  hash: string;
}

const commonData: HashData[] = [
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
  }
];

export function KeccakTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const filteredData = commonData.filter(item =>
    item.input.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Keccak-256 Hash Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Search by input, type, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left">Input</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Description</th>
                  <th className="px-4 py-3 text-left">Hash</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/50">
                    <td className="px-4 py-3 font-mono text-sm">{item.input}</td>
                    <td className="px-4 py-3 text-sm">{item.type}</td>
                    <td className="px-4 py-3 text-sm">{item.description}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => copyToClipboard(item.hash)}
                        className="font-mono text-sm text-primary hover:underline"
                        title="Click to copy"
                      >
                        {item.hash}
                        {copied === item.hash && (
                          <span className="ml-2 text-green-500 text-xs">
                            Copied!
                          </span>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}