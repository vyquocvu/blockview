import { ERC20_TOKENS } from "../lib/tokens";
import { SearchBar } from "./SearchBar";

export function TokensPage() {
  return (
    <div className="space-y-6">
      <SearchBar />
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 text-left">Symbol</th>
              <th className="px-4 py-3 text-left">Address</th>
              <th className="px-4 py-3 text-left">Decimals</th>
            </tr>
          </thead>
          <tbody>
            {ERC20_TOKENS.map((token) => (
              <tr key={token.address} className="border-t hover:bg-muted/50 text-left text-base">
                <td className="px-4 py-3">
                  <a href={`#/token/${token.address}`} className="text-primary hover:underline">
                    {token.symbol}
                  </a>
                </td>
                <td className="px-4 py-3 font-mono break-all">
                  <a href={`#/token/${token.address}`} className="text-primary hover:underline">
                    {token.address}
                  </a>
                </td>
                <td className="px-4 py-3">{token.decimals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
