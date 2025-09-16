import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { getLogs } from "../lib/blockchain";
import { formatAddress } from "../lib/format";

interface LogEntry {
  address: string;
  topics: string[];
  data: string;
  blockNumber: number;
  transactionHash: string;
  transactionIndex: number;
  blockHash: string;
  logIndex: number;
}

export function EventLogFilter() {
  const [fromBlock, setFromBlock] = useState("latest");
  const [toBlock, setToBlock] = useState("latest");
  const [address, setAddress] = useState("");
  const [topic0, setTopic0] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setLogs([]);

    try {
      const filter: any = {
        fromBlock: fromBlock || "latest",
        toBlock: toBlock || "latest",
      };

      if (address) {
        filter.address = address;
      }

      if (topic0) {
        filter.topics = [topic0];
      }

      const logResults = await getLogs(filter);
      setLogs(logResults as LogEntry[]);
    } catch (err: any) {
      console.error("Error fetching logs:", err);
      setError(err.message || "Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  const presetFilters = [
    {
      name: "ERC20 Transfers",
      topic: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      description: "Transfer(address,address,uint256)"
    },
    {
      name: "ERC721 Transfers", 
      topic: "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
      description: "Transfer(address,address,uint256)"
    },
    {
      name: "Contract Creation",
      topic: "0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0",
      description: "OwnershipTransferred(address,address)"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Event Log Filter</CardTitle>
          <p className="text-sm text-muted-foreground">
            Search for blockchain events and logs with custom filters
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fromBlock">From Block</Label>
                <Input
                  id="fromBlock"
                  value={fromBlock}
                  onChange={(e) => setFromBlock(e.target.value)}
                  placeholder="latest or block number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="toBlock">To Block</Label>
                <Input
                  id="toBlock"
                  value={toBlock}
                  onChange={(e) => setToBlock(e.target.value)}
                  placeholder="latest or block number"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Contract Address (optional)</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="0x..."
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="topic0">Topic 0 (Event Signature Hash)</Label>
              <Input
                id="topic0"
                value={topic0}
                onChange={(e) => setTopic0(e.target.value)}
                placeholder="0x..."
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Searching..." : "Search Logs"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Common Event Signatures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            {presetFilters.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setTopic0(preset.topic)}
                className="justify-start text-left"
              >
                <div>
                  <div className="font-medium">{preset.name}</div>
                  <div className="text-xs text-muted-foreground">{preset.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Found {logs.length} log{logs.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="border p-4 rounded-lg">
                  <div className="grid gap-2 text-sm">
                    <div className="flex">
                      <span className="w-24 font-medium text-muted-foreground">Address:</span>
                      <a
                        href={`#/address/${log.address}`}
                        className="text-primary hover:underline font-mono"
                      >
                        {formatAddress(log.address)}
                      </a>
                    </div>
                    <div className="flex">
                      <span className="w-24 font-medium text-muted-foreground">Block:</span>
                      <a
                        href={`#/block/${log.blockNumber}`}
                        className="text-primary hover:underline"
                      >
                        {log.blockNumber}
                      </a>
                    </div>
                    <div className="flex">
                      <span className="w-24 font-medium text-muted-foreground">Tx Hash:</span>
                      <a
                        href={`#/tx/${log.transactionHash}`}
                        className="text-primary hover:underline font-mono"
                      >
                        {formatAddress(log.transactionHash)}
                      </a>
                    </div>
                    <div className="flex">
                      <span className="w-24 font-medium text-muted-foreground">Topics:</span>
                      <div className="space-y-1">
                        {log.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="font-mono text-xs break-all">
                            {topic}
                          </div>
                        ))}
                      </div>
                    </div>
                    {log.data && log.data !== "0x" && (
                      <div className="flex">
                        <span className="w-24 font-medium text-muted-foreground">Data:</span>
                        <div className="font-mono text-xs break-all">{log.data}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}