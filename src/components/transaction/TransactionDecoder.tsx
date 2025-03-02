import { useState } from "react";
import { Interface, Log } from "ethers";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "../ui/dialog";
import { Textarea } from "../ui/textarea";

type DecodedFunction = {
  name: string;
  params: Array<{ name: string; value: string; type: string }>;
}

type DecodedLog = {
  name: string;
  params: Array<{ name: string; value: string; type: string }>;
  address: string;
}

interface TransactionDecoderProps {
  transactionData: string;
  transactionValue?: bigint;
  onDecodedFunction: (decodedFunction: DecodedFunction | null) => void;
}

export function TransactionDecoder({ 
  transactionData, 
  transactionValue, 
  onDecodedFunction 
}: TransactionDecoderProps) {
  const [abiInput, setAbiInput] = useState<string>("");
  const [decodeError, setDecodeError] = useState<string | null>(null);

  const decodeTransactionData = () => {
    try {
      setDecodeError(null);
      if (!abiInput || !transactionData) return;
      
      const abiArray = JSON.parse(abiInput);
      const iface = new Interface(abiArray);
      
      const decoded = iface.parseTransaction({ 
        data: transactionData, 
        value: transactionValue || 0n 
      });
      
      if (!decoded) {
        setDecodeError("Could not decode transaction data with provided ABI");
        return;
      }
      
      const params = decoded.args.map((arg, i) => {
        const fragment = decoded.fragment;
        return {
          name: fragment.inputs[i]?.name || `param${i}`,
          value: arg,
          type: fragment.inputs[i]?.type || 'unknown'
        };
      });
      
      onDecodedFunction({
        name: decoded.name,
        params
      });
    } catch (err) {
      console.error("Error decoding transaction data:", err);
      setDecodeError(err instanceof Error ? err.message : "Invalid ABI format");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Decode Data</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Decode Transaction Data</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter Contract ABI</label>
            <Textarea 
              placeholder="Paste contract ABI here (JSON format)" 
              value={abiInput} 
              onChange={(e) => setAbiInput(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          {decodeError && (
            <div className="bg-destructive/20 text-destructive p-2 rounded-md text-sm">
              {decodeError}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => decodeTransactionData()}>Decode</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface EventLogsDecoderProps {
  logs: ReadonlyArray<Log>;
  onDecodedLogs: (decodedLogs: DecodedLog[]) => void;
}

export function EventLogsDecoder({ logs, onDecodedLogs }: EventLogsDecoderProps) {
  const [abiInput, setAbiInput] = useState<string>("");
  const [decodeError, setDecodeError] = useState<string | null>(null);

  const decodeEventLogs = () => {
    try {
      setDecodeError(null);
      if (!abiInput || !logs.length) return;
      const abiArray = JSON.parse(abiInput);
      const iface = new Interface(abiArray);
      const decodedLogsResult = logs.map(log => {
        try {
          if (!log.topics || log.topics.length === 0) return null;
          const decoded = iface.parseLog({
            topics: log.topics as string[],
            data: log.data
          });
          if (!decoded) return null;
          const params = decoded.args.map((arg, i) => {
            const fragment = decoded.fragment;
            return {
              name: fragment.inputs[i]?.name || `param${i}`,
              value: arg,
              type: fragment.inputs[i]?.type || 'unknown'
            };
          });
          return {
            name: decoded.name,
            params,
            address: log.address
          };
        } catch {
          return null;
        }
      }).filter(Boolean) as DecodedLog[];
      if (decodedLogsResult.length === 0) {
        setDecodeError("Could not decode any logs with provided ABI");
        return;
      }
      onDecodedLogs(decodedLogsResult);
    } catch (err) {
      console.error("Error decoding event logs:", err);
      setDecodeError(err instanceof Error ? err.message : "Invalid ABI format");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Decode Logs</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Decode Event Logs</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Enter Contract ABI</label>
            <Textarea 
              placeholder="Paste contract ABI here (JSON format)" 
              value={abiInput} 
              onChange={(e) => setAbiInput(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          {decodeError && (
            <div className="bg-destructive/20 text-destructive p-2 rounded-md text-sm">
              {decodeError}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => decodeEventLogs()}>Decode</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}