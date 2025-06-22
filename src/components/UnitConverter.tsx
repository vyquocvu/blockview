import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { ethers } from "ethers";

export function UnitConverter() {
  const [wei, setWei] = useState("");
  const [gwei, setGwei] = useState("");
  const [ether, setEther] = useState("");

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

  return (
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
    </div>
  );
}
