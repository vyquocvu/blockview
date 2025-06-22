import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { getBlock, provider } from "@/lib/blockchain";

export function BlockTimeConverter() {
  const [blockNumber, setBlockNumber] = useState("");
  const [timestamp, setTimestamp] = useState("");

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
    <div className="space-y-4">
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
  );
}
