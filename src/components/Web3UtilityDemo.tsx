/**
 * Web3 Utility Demo Component
 * 
 * This component demonstrates the usage of the Web3 utility module.
 * It provides a UI for testing various Web3 operations.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  connectWallet,
  disconnectWallet,
  getWalletBalance,
  getCurrentChainId,
  switchNetwork,
  estimateTransactionGas,
  sendTransaction,
  signMessage,
  verifySignature,
  isValidAddress,
  formatAddressShort,
  getErrorMessage,
  WalletProvider,
  type WalletConnection,
  type BalanceInfo,
} from '../utils/web3';
import { ethers } from 'ethers';

export function Web3UtilityDemo() {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Input states for various operations
  const [addressToCheck, setAddressToCheck] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [messageToSign, setMessageToSign] = useState('');
  const [signature, setSignature] = useState('');
  const [targetChainId, setTargetChainId] = useState('1');

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const handleConnectWallet = async () => {
    clearMessages();
    setLoading(true);
    try {
      const conn = await connectWallet();
      setConnection(conn);
      setSuccess(`Connected to ${conn.providerType}: ${formatAddressShort(conn.address)}`);

      // Auto-fetch balance and chain ID
      const bal = await getWalletBalance(conn.address, conn.provider);
      setBalance(bal);

      const cid = await getCurrentChainId(conn.provider);
      setChainId(cid);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectWallet = () => {
    clearMessages();
    disconnectWallet();
    setConnection(null);
    setBalance(null);
    setChainId(null);
    setSuccess('Wallet disconnected');
  };

  const handleGetBalance = async () => {
    clearMessages();
    if (!connection) {
      setError('Please connect wallet first');
      return;
    }

    const addr = addressToCheck || connection.address;
    if (!isValidAddress(addr)) {
      setError('Invalid address');
      return;
    }

    setLoading(true);
    try {
      const bal = await getWalletBalance(addr, connection.provider);
      setBalance(bal);
      setSuccess(`Balance: ${bal.formattedBalance}`);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchNetwork = async () => {
    clearMessages();
    if (!connection) {
      setError('Please connect wallet first');
      return;
    }

    const targetId = parseInt(targetChainId);
    if (isNaN(targetId)) {
      setError('Invalid chain ID');
      return;
    }

    setLoading(true);
    try {
      await switchNetwork(targetId);
      const newChainId = await getCurrentChainId(connection.provider);
      setChainId(newChainId);
      setSuccess(`Switched to network ${newChainId}`);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEstimateGas = async () => {
    clearMessages();
    if (!connection) {
      setError('Please connect wallet first');
      return;
    }

    if (!isValidAddress(recipientAddress)) {
      setError('Invalid recipient address');
      return;
    }

    if (!sendAmount || isNaN(parseFloat(sendAmount))) {
      setError('Invalid amount');
      return;
    }

    setLoading(true);
    try {
      const gasEstimate = await estimateTransactionGas(
        {
          to: recipientAddress,
          value: ethers.parseEther(sendAmount).toString(),
        },
        connection.provider
      );
      setSuccess(
        `Gas estimate: ${gasEstimate.gasLimit.toString()} units, ` +
        `Estimated cost: ${gasEstimate.estimatedCost} ETH`
      );
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSendTransaction = async () => {
    clearMessages();
    if (!connection) {
      setError('Please connect wallet first');
      return;
    }

    if (!isValidAddress(recipientAddress)) {
      setError('Invalid recipient address');
      return;
    }

    if (!sendAmount || isNaN(parseFloat(sendAmount))) {
      setError('Invalid amount');
      return;
    }

    setLoading(true);
    try {
      const txHash = await sendTransaction(
        {
          to: recipientAddress,
          value: ethers.parseEther(sendAmount).toString(),
        },
        connection.provider
      );
      setSuccess(`Transaction sent! Hash: ${formatAddressShort(txHash, 10, 8)}`);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSignMessage = async () => {
    clearMessages();
    if (!connection) {
      setError('Please connect wallet first');
      return;
    }

    if (!messageToSign) {
      setError('Please enter a message to sign');
      return;
    }

    setLoading(true);
    try {
      const sig = await signMessage(messageToSign, connection.provider);
      setSignature(sig);
      setSuccess(`Message signed! Signature: ${formatAddressShort(sig, 10, 8)}`);
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySignature = () => {
    clearMessages();
    if (!messageToSign || !signature) {
      setError('Please provide both message and signature');
      return;
    }

    try {
      const signer = verifySignature(messageToSign, signature);
      setSuccess(`Signature verified! Signed by: ${formatAddressShort(signer)}`);
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Web3 Utility Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Connection Status</h3>
            {connection ? (
              <div className="space-y-2 text-sm">
                <p><strong>Address:</strong> {formatAddressShort(connection.address)}</p>
                <p><strong>Provider:</strong> {connection.providerType}</p>
                <p><strong>Chain ID:</strong> {chainId || 'Unknown'}</p>
                {balance && (
                  <p><strong>Balance:</strong> {balance.formattedBalance}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Not connected</p>
            )}
          </div>

          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded">
              {success}
            </div>
          )}

          {/* Wallet Connection */}
          <div className="space-y-2">
            <h3 className="font-semibold">1. Wallet Connection</h3>
            <div className="flex gap-2">
              <Button
                onClick={handleConnectWallet}
                disabled={loading || !!connection}
              >
                Connect Wallet
              </Button>
              <Button
                variant="outline"
                onClick={handleDisconnectWallet}
                disabled={loading || !connection}
              >
                Disconnect
              </Button>
            </div>
          </div>

          {/* Balance Check */}
          <div className="space-y-2">
            <h3 className="font-semibold">2. Check Balance</h3>
            <div className="space-y-2">
              <Input
                placeholder="Address (leave empty for connected wallet)"
                value={addressToCheck}
                onChange={(e) => setAddressToCheck(e.target.value)}
              />
              <Button onClick={handleGetBalance} disabled={loading || !connection}>
                Get Balance
              </Button>
            </div>
          </div>

          {/* Network Switching */}
          <div className="space-y-2">
            <h3 className="font-semibold">3. Switch Network</h3>
            <div className="space-y-2">
              <div>
                <Label htmlFor="chainId">Chain ID</Label>
                <Input
                  id="chainId"
                  placeholder="1 (Ethereum), 56 (BSC), 88 (Viction)"
                  value={targetChainId}
                  onChange={(e) => setTargetChainId(e.target.value)}
                />
              </div>
              <Button onClick={handleSwitchNetwork} disabled={loading || !connection}>
                Switch Network
              </Button>
            </div>
          </div>

          {/* Transaction Sending */}
          <div className="space-y-2">
            <h3 className="font-semibold">4. Send Transaction</h3>
            <div className="space-y-2">
              <div>
                <Label htmlFor="recipient">Recipient Address</Label>
                <Input
                  id="recipient"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (ETH)</Label>
                <Input
                  id="amount"
                  placeholder="0.1"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleEstimateGas}
                  disabled={loading || !connection}
                >
                  Estimate Gas
                </Button>
                <Button onClick={handleSendTransaction} disabled={loading || !connection}>
                  Send Transaction
                </Button>
              </div>
            </div>
          </div>

          {/* Message Signing */}
          <div className="space-y-2">
            <h3 className="font-semibold">5. Sign & Verify Message</h3>
            <div className="space-y-2">
              <div>
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  placeholder="Hello, Web3!"
                  value={messageToSign}
                  onChange={(e) => setMessageToSign(e.target.value)}
                />
              </div>
              <Button onClick={handleSignMessage} disabled={loading || !connection}>
                Sign Message
              </Button>
              {signature && (
                <>
                  <div>
                    <Label htmlFor="signature">Signature</Label>
                    <Input
                      id="signature"
                      value={signature}
                      readOnly
                      className="font-mono text-xs"
                    />
                  </div>
                  <Button variant="outline" onClick={handleVerifySignature}>
                    Verify Signature
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
