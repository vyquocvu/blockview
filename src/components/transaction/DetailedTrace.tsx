import React from "react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';

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

export const DetailedTrace: React.FC<DetailedTraceProps> = ({ trace }) => {
  if (!trace) {
    return null;
  }

  return (
    <div className="mt-4 p-4 border rounded-lg">
      <h3 className="text-lg font-bold mb-2">Transaction Trace</h3>
      <div className="overflow-auto text-left">
        <SyntaxHighlighter 
          language="json" 
          style={atomOneLight}
          customStyle={{
            margin: 0,
            borderRadius: '0.375rem'
          }}
        >
          {JSON.stringify(trace, null, 2)}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}