import { useState } from "react";
import { TransactionReceipt } from "ethers";
import { EventLogsDecoder } from "./TransactionDecoder";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { hexToDecimal } from "@/lib/format";

type DecodedLog = {
  name: string;
  params: Array<{ name: string; value: string; type: string }>;
  address: string;
}

interface TransactionLogsProps {
  receipt: TransactionReceipt;
  decodedLogs: DecodedLog[];
  onDecodedLogs: (logs: DecodedLog[]) => void;
}

export function TransactionLogs({ receipt, decodedLogs, onDecodedLogs }: TransactionLogsProps) {
  const [dataFormat, setDataFormat] = useState<"hex" | "dec">("hex");

  if (!receipt?.logs || receipt.logs.length === 0) {
    return null;
  }

  // Function to convert hex string to decimal

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
    <div className="text-left">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">Event Logs</h3>
        <div className="flex items-center space-x-2">
          <Tabs defaultValue="hex" value={dataFormat} onValueChange={(value) => setDataFormat(value as "hex" | "dec")}>
            <TabsList className="h-9">
              <TabsTrigger value="hex" className="text-xs">Hex</TabsTrigger>
              <TabsTrigger value="dec" className="text-xs">Dec</TabsTrigger>
            </TabsList>
          </Tabs>
          {!decodedLogs.length && (
            <EventLogsDecoder logs={receipt.logs} onDecodedLogs={onDecodedLogs} />
          )}
        </div>
      </div>
      <div className="space-y-3 mt-1">
        {(decodedLogs.length ? decodedLogs : receipt.logs).map((_, index) => {
          const decodedLog = decodedLogs[index];
          const rawLog = receipt.logs[index];
          return (
            <div key={index} className="bg-muted p-3 rounded-md overflow-x-auto">
              <div className="flex items-start mb-2">
                <span className="text-xs w-[54px] font-medium">Log #{index}</span>
                <a
                  href={`#/address/${decodedLog ? decodedLog.address : rawLog.address}`} 
                  className="text-xs text-primary hover:underline font-mono"
                >
                  {decodedLog ? decodedLog.address : rawLog.address}
                </a>
              </div>

              {decodedLog ? (
                <div className="mb-2">
                  <div className="text-xs font-semibold text-primary mb-1">Event: {decodedLog.name}</div>
                  {decodedLog.params.map((param, paramIndex) => (
                    <div key={paramIndex} className="text-xs font-mono break-all pl-2 border-l-2 border-muted-foreground/30 mb-1">
                      <span className="text-muted-foreground">{param.name} ({param.type}): </span>
                      <span>{formatValue(param.value, param.type)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {rawLog.topics && rawLog.topics.length > 0 && (
                    <div className="mb-2">
                      <div className="text-xs font-medium mb-1">Topics:</div>
                      {rawLog.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="text-xs font-mono break-all pl-2 border-l-2 border-muted-foreground/30">
                          {topicIndex === 0 ? "Event Signature: " : `Param #${topicIndex}: `}{dataFormat === "hex" ? topic : hexToDecimal(topic)}
                        </div>
                      ))}
                    </div>
                  )}

                  {rawLog.data && rawLog.data !== '0x' && (
                    <div>
                      <div className="text-xs font-medium mb-1">Data:</div>
                      <div className="text-xs font-mono break-all pl-2 border-l-2 border-muted-foreground/30">
                        {dataFormat === "hex" ? rawLog.data : hexToDecimal(rawLog.data)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}