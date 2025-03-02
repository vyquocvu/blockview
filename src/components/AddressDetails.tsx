import { useEffect, useState } from "react";
import { getBalance, getTransactionCount, getCode } from "../lib/blockchain";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";

interface AddressDetailsProps {
  address: string;
  onBack?: () => void;
}

export function AddressDetails({ address, onBack }: AddressDetailsProps) {
  const [balance, setBalance] = useState<string>("");
  const [transactionCount, setTransactionCount] = useState<number>(0);
  const [isContract, setIsContract] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [addressBalance, txCount, code] = await Promise.all([
          getBalance(address),
          getTransactionCount(address),
          getCode(address)
        ]);
        setBalance(addressBalance);
        setTransactionCount(txCount);
        setIsContract(code !== "0x");
      } catch (err) {
        console.error("Error fetching address data:", err);
        setError("Failed to fetch address data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (address) {
      fetchAddressData();
    }
  }, [address]);

  if (loading) {
    return (
      <div className="text-center p-8">
        <p>Loading address data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/20 text-destructive p-4 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Address Details</h2>
        {onBack && (
          <Button onClick={onBack} variant="outline">
            Go Back
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
              <p className="text-sm font-mono break-all">{address}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Balance</h3>
                <p className="text-sm">{balance} ETH</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Transactions</h3>
                <p className="text-sm">{transactionCount}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
              <p className="text-sm">{isContract ? "Contract" : "Externally Owned Account (EOA)"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {isContract && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Contract Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Contract Creator</h3>
                <p className="text-sm text-muted-foreground">Not available in basic view</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Creation Transaction</h3>
                <p className="text-sm text-muted-foreground">Not available in basic view</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}