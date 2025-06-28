import { SearchBar } from "./SearchBar";
import { useWallet } from "../context/WalletContext";
import { Profile } from "./Profile";

export function AccountsPage() {
  const { account } = useWallet();
  return (
    <div className="space-y-6">
      <SearchBar />
      {account ? (
        <Profile address={account} />
      ) : (
        <p className="p-4">Search for an address above or connect your wallet.</p>
      )}
    </div>
  );
}
