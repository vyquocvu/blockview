import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ethers } from "ethers";
import { getBlock, provider } from "@/lib/blockchain";

export function UnitHelper() {
  const [wei, setWei] = useState("");
  const [gwei, setGwei] = useState("");
  const [ether, setEther] = useState("");
  const [blockNumber, setBlockNumber] = useState("");
  const [timestamp, setTimestamp] = useState("");

  const handleWeiChange = (value: string) => {
    setWei(value);
    try {
      const bn = BigInt(value || "0");
      setGwei(ethers.formatUnits(bn, "gwei"));
      setEther(ethers.formatEther(bn));
    } catch {
      setGwei("");
      setEther("");
    }
  };

  const handleGweiChange = (value: string) => {
    setGwei(value);
    try {
      const bn = ethers.parseUnits(value || "0", "gwei");
      setWei(bn.toString());
      setEther(ethers.formatEther(bn));
    } catch {
      setWei("");
      setEther("");
    }
  };

  const handleEtherChange = (value: string) => {
    setEther(value);
    try {
      const bn = ethers.parseEther(value || "0");
      setWei(bn.toString());
      setGwei(ethers.formatUnits(bn, "gwei"));
    } catch {
      setWei("");
      setGwei("");
    }
  };

  const handleBlockNumberChange = async (value: string) => {
    setBlockNumber(value);
    const num = Number(value);
    if (!Number.isNaN(num) && value !== "") {
      try {
        const block = await getBlock(num);
        if (block) {
          setTimestamp(block.timestamp.toString());
        } else {
          setTimestamp("");
        }
      } catch {
        setTimestamp("");
      }
    } else {
      setTimestamp("");
    }
  };

  const handleTimestampChange = async (value: string) => {
    setTimestamp(value);
    const ts = Number(value);
    if (!Number.isNaN(ts) && value !== "") {
      try {
        const latestNumber = await provider.getBlockNumber();
        let low = 0;
        let high = latestNumber;
        let found = -1;
        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          const b = await provider.getBlock(mid);
          if (!b) {
            high = mid - 1;
            continue;
          }
          if (b.timestamp === ts) {
            found = b.number;
            break;
          } else if (b.timestamp < ts) {
            low = mid + 1;
          } else {
            high = mid - 1;
          }
        }
        if (found === -1 && high >= 0) {
          const b = await provider.getBlock(high);
          if (b && b.timestamp <= ts) {
            found = b.number;
          }
        }
        if (found !== -1) {
          setBlockNumber(found.toString());
        } else {
          setBlockNumber("");
        }
      } catch {
        setBlockNumber("");
      }
    } else {
      setBlockNumber("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Unit Helper</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2 text-left">
            <Label htmlFor="wei">Wei</Label>
            <Input
              id="wei"
              value={wei}
              onChange={(e) => handleWeiChange(e.target.value)}
            />
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="gwei">Gwei</Label>
            <Input
              id="gwei"
              value={gwei}
              onChange={(e) => handleGweiChange(e.target.value)}
            />
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="ether">Ether</Label>
            <Input
              id="ether"
              value={ether}
              onChange={(e) => handleEtherChange(e.target.value)}
            />
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="block">Block Number</Label>
            <Input
              id="block"
              value={blockNumber}
              onChange={(e) => handleBlockNumberChange(e.target.value)}
            />
          </div>
          <div className="space-y-2 text-left">
            <Label htmlFor="timestamp">Timestamp (sec)</Label>
            <Input
              id="timestamp"
              value={timestamp}
              onChange={(e) => handleTimestampChange(e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
