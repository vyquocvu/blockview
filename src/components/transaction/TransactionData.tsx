import { useState } from "react";
import { TransactionDecoder } from "./TransactionDecoder";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { hexToDecimal } from "../../lib/format";

type DecodedFunction = {
  name: string;
  params: Array<{ name: string; value: string; type: string }>;
}

interface TransactionDataProps {
  transactionData: string;
  transactionValue?: bigint;
  decodedFunction: DecodedFunction | null;
  onDecodedFunction: (decodedFunction: DecodedFunction | null) => void;
}

export function TransactionData({
  transactionData,
  transactionValue,
  decodedFunction,
  onDecodedFunction
}: TransactionDataProps) {
  const [dataFormat, setDataFormat] = useState<"hex" | "dec">("hex");

  if (!transactionData || transactionData === '0x') {
    return null;
  }

  // Format parameter value based on selected format
  const formatValue = (value: string, type: string): string => {
    if (value === null || value === undefined) return 'null';

    if (typeof value === 'object') return JSON.stringify(value);

    const strValue = String(value);

    // Only convert if it's a hex string and dec format is selected
    if (dataFormat === "dec" &&
        (type.includes('int') || type.includes('uint')) &&
        typeof value === 'string' &&
        value.startsWith('0x')) {
      return hexToDecimal(strValue);
    }
    return strValue;
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">Input Data</h3>
        <div className="flex items-center space-x-2">
          <Tabs defaultValue="hex" value={dataFormat} onValueChange={(value) => setDataFormat(value as "hex" | "dec")}>
            <TabsList className="h-9">
              <TabsTrigger value="hex" className="text-xs">Hex</TabsTrigger>
              <TabsTrigger value="dec" className="text-xs">Dec</TabsTrigger>
            </TabsList>
          </Tabs>
          <TransactionDecoder
            transactionData={transactionData}
            transactionValue={transactionValue}
            onDecodedFunction={onDecodedFunction}
          />
        </div>
      </div>
      <div className="bg-muted p-3 rounded-md my-1 overflow-x-auto">
        {decodedFunction ? (
          <div className="text-xs text-left font-mono">
            <div className="font-semibold text-primary mb-2">Function: {decodedFunction.name}</div>
            {decodedFunction.params.map((param, idx) => (
              <div key={idx} className="ml-4 mb-1">
                <span className="text-muted-foreground">{param.name} ({param.type}): </span>
                <span className="break-all">{formatValue(param.value, param.type)}</span>
              </div>
            ))}
          </div>
        ) : (
          <pre className="text-xs text-left font-mono break-all whitespace-pre-wrap">
            {dataFormat === "hex" ? transactionData : hexToDecimal(transactionData)}
          </pre>
        )}
      </div>
    </div>
  );
}