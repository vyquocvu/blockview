import React from "react";
import { JsonView } from "@/components/ui/json-view";

interface Call {
  type: string;
  from: string;
  to: string;
  value?: string;
  gas: string;
  gasUsed: string;
  input: string;
  output: string;
  calls?: Call[];
  error?: string;
}

interface DetailedTraceProps {
  trace: Call;
}

const TraceEntry: React.FC<{ call: Call; depth: number }> = ({ call, depth }) => {
  const hasError = !!call.error;
  const entryColor = hasError ? "bg-red-100 dark:bg-red-900" : (depth % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : "bg-white dark:bg-gray-900");

  return (
    <div style={{ marginLeft: `${depth * 20}px` }} className={`p-2 border-l-2 ${hasError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}>
      <div className={`${entryColor} p-3 rounded-md`}>
        <div className="font-mono text-sm">
          <p><strong>Type:</strong> {call.type}</p>
          <p><strong>From:</strong> {call.from}</p>
          <p><strong>To:</strong> {call.to}</p>
          {call.value && <p><strong>Value:</strong> {parseInt(call.value, 16)} wei</p>}
          <p><strong>Gas:</strong> {parseInt(call.gas, 16)}</p>
          <p><strong>Gas Used:</strong> {parseInt(call.gasUsed, 16)}</p>
          {hasError && <p className="text-red-500"><strong>Error:</strong> {call.error}</p>}
          <details>
            <summary className="cursor-pointer">Details</summary>
            <div className="pl-4">
              <p><strong>Input:</strong></p>
              <JsonView json={call.input} />
              <p><strong>Output:</strong></p>
              <JsonView json={call.output} />
            </div>
          </details>
        </div>
      </div>
      {call.calls && call.calls.map((nestedCall, index) => (
        <TraceEntry key={index} call={nestedCall} depth={depth + 1} />
      ))}
    </div>
  );
};

export const DetailedTrace: React.FC<DetailedTraceProps> = ({ trace }) => {
  if (!trace) {
    return null;
  }

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-bold mb-2">Transaction Trace</h3>
      <div className="font-mono text-xs overflow-auto">
        <TraceEntry call={trace} depth={0} />
      </div>
    </div>
  );
};