import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface JsonViewProps {
  json: string;
}

export const JsonView: React.FC<JsonViewProps> = ({ json }) => {
  try {
    const parsedJson = JSON.parse(json);
    const formattedJson = JSON.stringify(parsedJson, null, 2);
    return (
      <SyntaxHighlighter language="json" style={a11yDark}>
        {formattedJson}
      </SyntaxHighlighter>
    );
  } catch (error) {
    // If the input is not a valid JSON, display it as is.
    return (
      <textarea
        readOnly
        className="w-full h-24 bg-gray-100 dark:bg-gray-700 font-mono text-xs p-2 rounded-md"
        value={json}
      />
    );
  }
};