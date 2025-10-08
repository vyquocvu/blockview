import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { ethers } from "ethers";

export function ChecksumAddress() {
  const [inputAddress, setInputAddress] = useState("");
  const [checksumAddress, setChecksumAddress] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  const handleAddressChange = (value: string) => {
    setInputAddress(value);
    setError("");
    setChecksumAddress("");
    setIsValid(null);

    if (!value) {
      return;
    }

    try {
      // Check if it's a valid address
      if (ethers.isAddress(value)) {
        // Get checksummed version
        const checksummed = ethers.getAddress(value);
        setChecksumAddress(checksummed);
        setIsValid(true);

        // Check if input already has correct checksum
        if (value === checksummed) {
          setError("");
        } else if (value.toLowerCase() === checksummed.toLowerCase()) {
          setError("Address is valid but not checksummed");
        }
      } else {
        setIsValid(false);
        setError("Invalid Ethereum address");
      }
    } catch (err) {
      setIsValid(false);
      setError("Invalid Ethereum address format");
    }
  };

  const handleCopy = () => {
    if (checksumAddress) {
      navigator.clipboard.writeText(checksumAddress);
    }
  };

  const handleClear = () => {
    setInputAddress("");
    setChecksumAddress("");
    setIsValid(null);
    setError("");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Checksum Address</h3>
        <Button variant="outline" size="sm" onClick={handleClear}>
          Clear
        </Button>
      </div>
      <div className="space-y-2 text-left">
        <Label htmlFor="input-address">Input Address</Label>
        <Input
          id="input-address"
          placeholder="0x742d35cc6634c0532925a3b844bc9e7595f0beb"
          value={inputAddress}
          onChange={(e) => handleAddressChange(e.target.value)}
          className="font-mono text-xs"
        />
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
      </div>
      {checksumAddress && (
        <>
          <div className="space-y-2 text-left">
            <Label htmlFor="checksum-address">Checksummed Address</Label>
            <div className="flex gap-2">
              <Input
                id="checksum-address"
                value={checksumAddress}
                readOnly
                className="font-mono text-xs bg-muted"
              />
              <Button variant="outline" size="sm" onClick={handleCopy}>
                Copy
              </Button>
            </div>
          </div>
          <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded text-sm">
            <p className="font-semibold">✓ Valid Address</p>
            <p className="text-xs mt-1">
              EIP-55 checksum encoding helps prevent typos and ensures address integrity.
            </p>
          </div>
        </>
      )}
      {isValid === false && (
        <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded text-sm">
          <p className="font-semibold">✗ Invalid Address</p>
          <p className="text-xs mt-1">
            Please enter a valid Ethereum address (42 characters, starting with 0x).
          </p>
        </div>
      )}
    </div>
  );
}
