import { TransactionsList } from "./TransactionsList";
import { SearchBar } from "./SearchBar";

export function TransactionsPage() {
  return (
    <div className="space-y-6">
      <SearchBar />
      <TransactionsList />
    </div>
  );
}
