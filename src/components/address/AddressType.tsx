import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { provider } from "../../lib/blockchain";
import { formatAddress } from "../../lib/format";

interface AddressTypeProps {
  isContract: boolean;
  address?: string;
}

export function AddressType({ isContract, address }: AddressTypeProps) {
  const [contractCreator] = useState<string | null>(null);
  const [creationTx] = useState<string | null>(null);
  const [contractCode, setContractCode] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContractInfo = async () => {
      if (!isContract || !address) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Get the transaction history for this address to find the contract creation
        // const history =  [] //await provider.getHistory(address);
        
        // // The first transaction in the history should be the contract creation
        // if (history && history.length > 0) {
        //   const creationTransaction = history[0];
        //   setCreationTx(creationTransaction.hash);
        //   setContractCreator(creationTransaction.from);
        // }
      } catch (err) {
        console.error("Error fetching contract information:", err);
        setError("Failed to fetch contract information");
      } finally {
        setLoading(false);
      }
    };

    if (isContract && address) {
      fetchContractInfo();
      // get Code
      provider.getCode(address).then((code) => {
        setContractCode(code);
      });
    }
  }, [isContract, address]);

  return (
    <>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
        <p className="text-sm">{isContract ? "Contract" : "Externally Owned Account (EOA)"}</p>
      </div>

      {isContract && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-xl">Contract Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-1">
              <div className="flex">
                <h3 className="text-sm w-40 text-left font-medium text-muted-foreground">Contract Creator</h3>
                {loading ? (
                  <p className="text-sm">Loading...</p>
                ) : error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : contractCreator ? (
                  <p className="text-sm font-mono">
                    <a href={`#/address/${contractCreator}`} className="text-primary hover:underline">
                      {contractCreator}
                    </a>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Not available</p>
                )}
              </div>
              <div className="flex">
                <h3 className="text-sm w-40 text-left font-medium text-muted-foreground">Creation Transaction</h3>
                {loading ? (
                  <p className="text-sm">Loading...</p>
                ) : error ? (
                  <p className="text-sm text-destructive">{error}</p>
                ) : creationTx ? (
                  <p className="text-sm font-mono">
                    <a href={`#/tx/${creationTx}`} className="text-primary hover:underline">
                      {formatAddress(creationTx)}
                    </a>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Not available</p>
                )}
              </div>
              {
                contractCode && (
                  <div className="text-left">
                    <h3 className="text-sm font-medium text-muted-foreground pb-2">Contract Code</h3>
                    <pre className="text-xs rounded-md bg-muted overflow-auto p-3 text-left font-mono break-all whitespace-pre-wrap h-[20pc]">
                      {contractCode}
                    </pre>
                  </div>
                )
              }
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}