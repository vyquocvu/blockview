import { useState } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function HexConverter() {
  const [hex, setHex] = useState("");
  const [decimal, setDecimal] = useState("");
  const [binary, setBinary] = useState("");
  const [ascii, setAscii] = useState("");

  const handleHexChange = (value: string) => {
    setHex(value);
    try {
      // Remove '0x' prefix if present
      const cleanHex = value.startsWith('0x') ? value.slice(2) : value;
      if (!cleanHex) {
        setDecimal("");
        setBinary("");
        setAscii("");
        return;
      }

      // Validate hex
      if (!/^[0-9a-fA-F]*$/.test(cleanHex)) {
        throw new Error("Invalid hex");
      }

      // Convert to decimal
      const decValue = BigInt('0x' + cleanHex).toString(10);
      setDecimal(decValue);

      // Convert to binary
      const binValue = BigInt('0x' + cleanHex).toString(2);
      setBinary(binValue);

      // Convert to ASCII (if valid)
      try {
        let asciiValue = "";
        for (let i = 0; i < cleanHex.length; i += 2) {
          const byte = parseInt(cleanHex.substr(i, 2), 16);
          if (byte >= 32 && byte <= 126) {
            asciiValue += String.fromCharCode(byte);
          } else {
            asciiValue += ".";
          }
        }
        setAscii(asciiValue);
      } catch {
        setAscii("");
      }
    } catch {
      setDecimal("");
      setBinary("");
      setAscii("");
    }
  };

  const handleDecimalChange = (value: string) => {
    setDecimal(value);
    try {
      if (!value) {
        setHex("");
        setBinary("");
        setAscii("");
        return;
      }

      // Validate decimal
      if (!/^\d+$/.test(value)) {
        throw new Error("Invalid decimal");
      }

      const bigIntValue = BigInt(value);
      const hexValue = "0x" + bigIntValue.toString(16);
      setHex(hexValue);

      const binValue = bigIntValue.toString(2);
      setBinary(binValue);

      // Clear ASCII for decimal input
      setAscii("");
    } catch {
      setHex("");
      setBinary("");
      setAscii("");
    }
  };

  const handleBinaryChange = (value: string) => {
    setBinary(value);
    try {
      if (!value) {
        setHex("");
        setDecimal("");
        setAscii("");
        return;
      }

      // Validate binary
      if (!/^[01]+$/.test(value)) {
        throw new Error("Invalid binary");
      }

      const bigIntValue = BigInt('0b' + value);
      const hexValue = "0x" + bigIntValue.toString(16);
      setHex(hexValue);

      const decValue = bigIntValue.toString(10);
      setDecimal(decValue);

      // Clear ASCII for binary input
      setAscii("");
    } catch {
      setHex("");
      setDecimal("");
      setAscii("");
    }
  };

  const handleClear = () => {
    setHex("");
    setDecimal("");
    setBinary("");
    setAscii("");
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold">Hex Converter</h3>
        <Button variant="outline" size="sm" onClick={handleClear} className="h-7 text-xs">
          Clear
        </Button>
      </div>
      <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
        <Label htmlFor="hex" className="text-xs">Hexadecimal</Label>
        <Input
          id="hex"
          placeholder="0x1a2b3c or 1a2b3c"
          value={hex}
          onChange={(e) => handleHexChange(e.target.value)}
          className="font-mono h-8 text-sm"
        />
      </div>
      <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
        <Label htmlFor="decimal" className="text-xs">Decimal</Label>
        <Input
          id="decimal"
          placeholder="1731164"
          value={decimal}
          onChange={(e) => handleDecimalChange(e.target.value)}
          className="font-mono h-8 text-sm"
        />
      </div>
      <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
        <Label htmlFor="binary" className="text-xs">Binary</Label>
        <Input
          id="binary"
          placeholder="110100101011001111000"
          value={binary}
          onChange={(e) => handleBinaryChange(e.target.value)}
          className="font-mono text-xs h-8"
        />
      </div>
      {ascii && (
        <div className="grid grid-cols-[100px_1fr] gap-2 items-center">
          <Label htmlFor="ascii" className="text-xs">ASCII</Label>
          <Input
            id="ascii"
            value={ascii}
            readOnly
            className="font-mono bg-muted h-8 text-sm"
          />
        </div>
      )}
    </div>
  );
}
