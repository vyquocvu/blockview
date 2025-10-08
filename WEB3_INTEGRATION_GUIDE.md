# Web3 Utility Integration Guide

This guide shows how to integrate the Web3 utility module (`src/utils/web3.ts`) with the existing `WalletContext` and use it throughout the application.

## Integration with WalletContext

The existing `WalletContext` can be enhanced to use the Web3 utilities. Here's an example of how to refactor it:

### Before (Current Implementation)

```typescript
// src/context/WalletContext.tsx
export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const connectWallet = async () => {
    try {
      const ethProvider: any = (window as any).ethereum || (window as any).okxwallet;
      if (!ethProvider) {
        throw new Error("No wallet provider found");
      }
      const accounts: string[] = await ethProvider.request({ method: "eth_requestAccounts" });
      setProvider(new BrowserProvider(ethProvider));
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      throw err;
    }
  };

  // ...
}
```

### After (Using Web3 Utilities)

```typescript
// src/context/WalletContext.tsx
import { connectWallet as web3Connect, disconnectWallet as web3Disconnect } from '../utils/web3';

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const connectWallet = async () => {
    try {
      const connection = await web3Connect();
      setProvider(connection.provider);
      setAccount(connection.address);
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      throw err;
    }
  };

  const disconnectWallet = () => {
    web3Disconnect();
    setAccount(null);
    setProvider(null);
  };

  // ...
}
```

## Usage Examples in Components

### Example 1: Get Balance in AddressDetails Component

```typescript
// src/components/AddressDetails.tsx
import { useEffect, useState } from 'react';
import { getWalletBalance } from '../utils/web3';
import { useWallet } from '../context/WalletContext';

export function AddressDetails({ address }: { address: string }) {
  const { provider } = useWallet();
  const [balance, setBalance] = useState<string>('');

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balanceInfo = await getWalletBalance(address, provider);
        setBalance(balanceInfo.formattedBalance);
      } catch (error) {
        console.error('Error fetching balance:', error);
      }
    };
    
    if (address) {
      fetchBalance();
    }
  }, [address, provider]);

  return <div>Balance: {balance}</div>;
}
```

### Example 2: Send Transaction Component

```typescript
// src/components/SendTransaction.tsx
import { useState } from 'react';
import { sendTransaction, estimateTransactionGas, getErrorMessage } from '../utils/web3';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function SendTransaction() {
  const { provider } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!provider) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Estimate gas first
      const gasEstimate = await estimateTransactionGas(
        {
          to: recipient,
          value: ethers.parseEther(amount).toString(),
        },
        provider
      );

      console.log('Estimated cost:', gasEstimate.estimatedCost, 'ETH');

      // Send transaction
      const txHash = await sendTransaction(
        {
          to: recipient,
          value: ethers.parseEther(amount).toString(),
        },
        provider
      );

      console.log('Transaction sent:', txHash);
      alert(`Transaction sent! Hash: ${txHash}`);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Recipient address"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <Input
        placeholder="Amount (ETH)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Button onClick={handleSend} disabled={loading}>
        {loading ? 'Sending...' : 'Send Transaction'}
      </Button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
```

### Example 3: Network Switcher Component

```typescript
// src/components/NetworkSwitcher.tsx
import { useState } from 'react';
import { switchNetwork, getCurrentChainId, getErrorMessage } from '../utils/web3';
import { useWallet } from '../context/WalletContext';
import { Button } from './ui/button';

const NETWORKS = [
  { id: 1, name: 'Ethereum Mainnet' },
  { id: 56, name: 'BNB Smart Chain' },
  { id: 88, name: 'Viction' },
];

export function NetworkSwitcher() {
  const { provider } = useWallet();
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChainId = async () => {
      if (provider) {
        try {
          const chainId = await getCurrentChainId(provider);
          setCurrentChainId(chainId);
        } catch (err) {
          console.error('Error fetching chain ID:', err);
        }
      }
    };

    fetchChainId();
  }, [provider]);

  const handleSwitch = async (chainId: number) => {
    setError(null);
    try {
      await switchNetwork(chainId);
      setCurrentChainId(chainId);
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-4">
      <div>Current Network: {currentChainId || 'Unknown'}</div>
      <div className="flex gap-2">
        {NETWORKS.map((network) => (
          <Button
            key={network.id}
            onClick={() => handleSwitch(network.id)}
            variant={currentChainId === network.id ? 'default' : 'outline'}
          >
            {network.name}
          </Button>
        ))}
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
```

### Example 4: Message Signing for Authentication

```typescript
// src/components/SignInWithWallet.tsx
import { useState } from 'react';
import { signMessage, verifySignature, getErrorMessage } from '../utils/web3';
import { useWallet } from '../context/WalletContext';
import { Button } from './ui/button';

export function SignInWithWallet() {
  const { provider, account } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!provider || !account) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create a unique message for signing
      const nonce = Math.random().toString(36).substring(7);
      const message = `Sign in to BlockView\nNonce: ${nonce}`;

      // Sign the message
      const signature = await signMessage(message, provider);

      // Verify the signature (optional, usually done on backend)
      const signer = verifySignature(message, signature);

      if (signer.toLowerCase() === account.toLowerCase()) {
        console.log('Signature verified! User authenticated.');
        // Send signature to backend for session creation
        // await fetch('/api/auth', { method: 'POST', body: JSON.stringify({ message, signature }) });
      }
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={handleSignIn} disabled={loading}>
        {loading ? 'Signing...' : 'Sign In with Wallet'}
      </Button>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
```

### Example 5: Token Balance Checker

```typescript
// src/components/TokenBalance.tsx
import { useEffect, useState } from 'react';
import { callContractMethod, getErrorMessage } from '../utils/web3';
import { useWallet } from '../context/WalletContext';
import { ethers } from 'ethers';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

export function TokenBalance({ tokenAddress }: { tokenAddress: string }) {
  const { provider, account } = useWallet();
  const [balance, setBalance] = useState<string>('');
  const [symbol, setSymbol] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokenBalance = async () => {
      if (!provider || !account) return;

      try {
        // Get token symbol
        const tokenSymbol = await callContractMethod(
          tokenAddress,
          ERC20_ABI,
          'symbol',
          [],
          provider
        );
        setSymbol(tokenSymbol);

        // Get token decimals
        const decimals = await callContractMethod(
          tokenAddress,
          ERC20_ABI,
          'decimals',
          [],
          provider
        );

        // Get token balance
        const balanceWei = await callContractMethod(
          tokenAddress,
          ERC20_ABI,
          'balanceOf',
          [account],
          provider
        );

        const formattedBalance = ethers.formatUnits(balanceWei, decimals);
        setBalance(formattedBalance);
      } catch (err: any) {
        setError(getErrorMessage(err));
      }
    };

    fetchTokenBalance();
  }, [tokenAddress, provider, account]);

  if (error) return <div className="text-red-500">{error}</div>;
  
  return <div>Balance: {balance} {symbol}</div>;
}
```

## Best Practices

1. **Error Handling**: Always use `try-catch` blocks and the `getErrorMessage()` utility for user-friendly error messages.

2. **Provider Management**: Pass the provider from `WalletContext` to Web3 utilities to maintain consistency.

3. **Loading States**: Show loading indicators during async operations for better UX.

4. **Validation**: Use `isValidAddress()` to validate addresses before operations.

5. **Gas Estimation**: Always estimate gas before sending transactions to avoid failed transactions.

6. **Event Listeners**: Use `setupWalletEventListeners()` in your context or root component to handle wallet events globally.

## Testing the Utilities

The Web3 Utility Demo component (`src/components/Web3UtilityDemo.tsx`) provides an interactive testing interface. Access it at `#/web3-demo` to:

- Test all utility functions
- Verify wallet connections
- Practice transaction sending
- Explore message signing
- Learn implementation patterns

## Extending the Utilities

To add new Web3 functionality:

1. Add the function to `src/utils/web3.ts`
2. Follow the existing patterns for error handling
3. Add comprehensive JSDoc comments
4. Export the function in the default export
5. Add usage examples in comments
6. Test the function in the Web3 Demo component

## Support

For issues or questions about the Web3 utilities:

- Check the inline documentation in `src/utils/web3.ts`
- Review the demo component at `src/components/Web3UtilityDemo.tsx`
- Test interactively at `#/web3-demo`
