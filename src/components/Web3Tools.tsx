/**
 * Web3 & Helper Tools Component
 * 
 * This component provides a unified interface for Web3 utilities and helper tools.
 * Features are organized in tabs for easy navigation.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { UnitConverter } from './UnitConverter';
import { BlockTimeConverter } from './BlockTimeConverter';
import { GasEstimator } from './GasEstimator';
import { HexConverter } from './HexConverter';
import { ChecksumAddress } from './ChecksumAddress';
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
  type WalletConnection,
  type BalanceInfo,
} from '../utils/web3';
import { ethers } from 'ethers';

export function Web3Tools() {
  // Web3 state
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [balance, setBalance] = useState<BalanceInfo | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Input states
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
      setSuccess(`Connected: ${formatAddressShort(conn.address)}`);

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
        `Gas: ${gasEstimate.gasLimit.toString()} units, Cost: ${gasEstimate.estimatedCost} ETH`
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
      setSuccess(`Message signed!`);
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
      setSuccess(`Verified! Signed by: ${formatAddressShort(signer)}`);
    } catch (err: any) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Web3 & Helper Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="wallet" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="signing">Signing</TabsTrigger>
            <TabsTrigger value="converters">Converters</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-4">
            {/* Connection Status */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">Connection Status</h3>
              {connection ? (
                <div className="space-y-1 text-sm">
                  <p><strong>Address:</strong> {formatAddressShort(connection.address)}</p>
                  <p><strong>Provider:</strong> {connection.providerType}</p>
                  <p><strong>Chain ID:</strong> {chainId || 'Unknown'}</p>
                  {balance && <p><strong>Balance:</strong> {balance.formattedBalance}</p>}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Not connected</p>
              )}
            </div>

            {/* Messages */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded text-sm">
                {success}
              </div>
            )}

            {/* Connect/Disconnect */}
            <div className="space-y-2">
              <h3 className="font-semibold">Wallet Connection</h3>
              <div className="flex gap-2">
                <Button onClick={handleConnectWallet} disabled={loading || !!connection}>
                  Connect Wallet
                </Button>
                <Button variant="outline" onClick={handleDisconnectWallet} disabled={loading || !connection}>
                  Disconnect
                </Button>
              </div>
            </div>

            {/* Balance Check */}
            <div className="space-y-2">
              <h3 className="font-semibold">Check Balance</h3>
              <Input
                placeholder="Address (leave empty for connected wallet)"
                value={addressToCheck}
                onChange={(e) => setAddressToCheck(e.target.value)}
              />
              <Button onClick={handleGetBalance} disabled={loading || !connection} className="w-full">
                Get Balance
              </Button>
            </div>

            {/* Network Switching */}
            <div className="space-y-2">
              <h3 className="font-semibold">Switch Network</h3>
              <Label htmlFor="chainId">Chain ID (1=Ethereum, 56=BSC, 88=Viction)</Label>
              <Input
                id="chainId"
                placeholder="Chain ID"
                value={targetChainId}
                onChange={(e) => setTargetChainId(e.target.value)}
              />
              <Button onClick={handleSwitchNetwork} disabled={loading || !connection} className="w-full">
                Switch Network
              </Button>
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-4">
            {/* Messages */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded text-sm">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-semibold">Send Transaction</h3>
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
                  <Button variant="outline" onClick={handleEstimateGas} disabled={loading || !connection}>
                    Estimate Gas
                  </Button>
                  <Button onClick={handleSendTransaction} disabled={loading || !connection}>
                    Send Transaction
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Signing Tab */}
          <TabsContent value="signing" className="space-y-4">
            {/* Messages */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded text-sm">
                {success}
              </div>
            )}

            <div className="space-y-2">
              <h3 className="font-semibold">Sign & Verify Message</h3>
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
                <Button onClick={handleSignMessage} disabled={loading || !connection} className="w-full">
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
                    <Button variant="outline" onClick={handleVerifySignature} className="w-full">
                      Verify Signature
                    </Button>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Converters Tab */}
          <TabsContent value="converters" className="space-y-6">
            <UnitConverter />
            <BlockTimeConverter />
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <GasEstimator />
            <HexConverter />
            <ChecksumAddress />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
