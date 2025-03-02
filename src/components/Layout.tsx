import React from "react";
import { Card, CardContent } from "./ui/card";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6 md:gap-10">
            <h1 className="text-xl font-bold">EVM Blockchain Explorer</h1>
          </div>
          <nav className="flex items-center space-x-6">
            <a href="#/" className="text-sm font-medium transition-colors hover:text-primary">Home</a>
            <a href="#/transactions" className="text-sm font-medium transition-colors hover:text-primary">Transactions</a>
            <a href="#/blocks" className="text-sm font-medium transition-colors hover:text-primary">Blocks</a>
            <a href="#/accounts" className="text-sm font-medium transition-colors hover:text-primary">Accounts</a>
            <a href="#/tokens" className="text-sm font-medium transition-colors hover:text-primary">Tokens</a>
          </nav>
        </div>
      </header>
      <main className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6">{children}</CardContent>
        </Card>
      </main>
    </div>
  );
}