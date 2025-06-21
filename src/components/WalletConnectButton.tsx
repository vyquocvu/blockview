import { useState } from "react";
import { Button } from "./ui/button";
import { useWallet } from "../context/WalletContext";
import { formatAddress } from "../lib/format";

export function WalletConnectButton() {
  const { account, connectWallet, disconnectWallet } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (account) {
      disconnectWallet();
      return;
    }
    setLoading(true);
    try {
      await connectWallet();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
      {loading
        ? "Connecting..."
        : account
        ? formatAddress(account)
        : "Connect Wallet"}
    </Button>
  );
}
