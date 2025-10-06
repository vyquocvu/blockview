import React from "react";
import { JsonView, collapseAllNested, darkStyles, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

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

  // Check if dark mode is enabled by checking the document root class
  const isDarkMode = document.documentElement.classList.contains('dark');

  return (
    <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
      <h3 className="text-lg font-bold mb-2">Transaction Trace</h3>
      <div className="overflow-auto">
        <JsonView 
          data={trace} 
          shouldExpandNode={collapseAllNested}
          style={isDarkMode ? darkStyles : defaultStyles}
        />
      </div>
    </div>
  );
};