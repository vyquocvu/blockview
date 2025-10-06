import { useState } from "react";
import { makeRpcCall } from "../../lib/blockchain";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

interface DebugApisProps {
  txHash: string;
}

const DEBUG_APIS = [
  {
    name: "debug_traceTransaction",
    params: [null, { tracer: "callTracer" }],
    description: "Traces the execution of a transaction.",
  },
  {
    name: "debug_getRawTransaction",
    params: [null],
    description: "Retrieves the RLP-encoded transaction.",
  },
];

export function DebugApis({ txHash }: DebugApisProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const [selectedApi, setSelectedApi] = useState<string | null>(null);

  const handleApiCall = async (api: { name: string; params: any[] }) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedApi(api.name);

    try {
      const params = api.params.map((p) => {
        if (p === null) {
          // Placeholder for transaction hash, block number etc.
          // This needs to be customized based on the API
          return txHash;
        }
        return p;
      });
      const data = await makeRpcCall(api.name, params);
      setResult(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      console.error(`Error calling ${api.name}:`, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debug APIs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {DEBUG_APIS.map((api) => (
            <Button
              key={api.name}
              onClick={() => handleApiCall(api)}
              disabled={loading && selectedApi === api.name}
              variant="outline"
            >
              {loading && selectedApi === api.name
                ? "Loading..."
                : api.name}
            </Button>
          ))}
        </div>
        {error && (
          <div className="mt-4 text-red-500 bg-red-100 dark:bg-red-900 p-3 rounded-md">
            <p>
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}
        {result && (
          <div className="mt-4">
            <h4 className="font-bold">Result for {selectedApi}</h4>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}