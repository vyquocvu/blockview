import { useState } from "react";
import { updateRpcUrl } from "../lib/blockchain";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useNetwork } from "../context/NetworkContext";
import { PREDEFINED_NETWORKS, NetworkConfig } from "../lib/networks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface RpcUrlDialogProps {
  onUpdate: () => void;
}

export function RpcUrlDialog({ onUpdate }: RpcUrlDialogProps) {
  const { setRpcUrl } = useNetwork();
  const [open, setOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [selectedRpcIndex, setSelectedRpcIndex] = useState<number>(0);
  const [customRpcUrl, setCustomRpcUrl] = useState(
    localStorage.getItem("custom_rpc_url") || "https://rpc.viction.xyz"
  );
  const [activeTab, setActiveTab] = useState<string>("predefined");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (open) {
      setError(null);
      setActiveTab("predefined");
      setSelectedNetwork("");
      setSelectedRpcIndex(0);
    }
  };

  const handleNetworkSelect = (networkId: string) => {
    setSelectedNetwork(networkId);
    setSelectedRpcIndex(0);
    setError(null);
  };

  const handleRpcSelect = (rpcIndex: string) => {
    setSelectedRpcIndex(parseInt(rpcIndex));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let rpcUrl: string;
      
      if (activeTab === "predefined") {
        if (!selectedNetwork) {
          setError("Please select a network");
          return;
        }
        
        const network = PREDEFINED_NETWORKS[selectedNetwork];
        rpcUrl = network.rpcUrls[selectedRpcIndex];
      } else {
        if (!customRpcUrl.trim()) {
          setError("Please enter a valid RPC URL");
          return;
        }
        
        // Validate URL format
        new URL(customRpcUrl);
        rpcUrl = customRpcUrl;
      }
      
      // Update the RPC URL
      await updateRpcUrl(rpcUrl);
      setRpcUrl(rpcUrl);
      
      // Trigger the parent component to refresh network info
      onUpdate();
      
      // Close the dialog
      setOpen(false);
    } catch (err) {
      console.error("Error updating RPC URL:", err);
      setError("Invalid URL format or connection failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedNetworkInfo = (): NetworkConfig | null => {
    return selectedNetwork ? PREDEFINED_NETWORKS[selectedNetwork] : null;
  };

  const getCurrentRpcUrl = (): string => {
    if (activeTab === "predefined") {
      const network = getSelectedNetworkInfo();
      return network ? network.rpcUrls[selectedRpcIndex] : "";
    }
    return customRpcUrl;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Change RPC
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Change RPC Network</DialogTitle>
          <DialogDescription>
            Select a predefined network or enter a custom RPC URL to connect to a different blockchain.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="predefined">Popular Networks</TabsTrigger>
            <TabsTrigger value="custom">Custom RPC</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit}>
            <TabsContent value="predefined" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="network">Select Network</Label>
                <Select value={selectedNetwork} onValueChange={handleNetworkSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a blockchain network" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PREDEFINED_NETWORKS).map(([id, network]) => (
                      <SelectItem key={id} value={id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{network.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({network.nativeCurrency.symbol})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedNetwork && (
                <div className="grid gap-2">
                  <Label htmlFor="rpc">RPC Endpoint</Label>
                  <Select value={selectedRpcIndex.toString()} onValueChange={handleRpcSelect}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getSelectedNetworkInfo()?.rpcUrls.map((url, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {url}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedNetwork && (
                <div className="bg-muted/50 p-3 rounded-md">
                  <div className="text-sm space-y-1">
                    <div><strong>Chain ID:</strong> {getSelectedNetworkInfo()?.chainId}</div>
                    <div><strong>Currency:</strong> {getSelectedNetworkInfo()?.nativeCurrency.symbol}</div>
                    <div><strong>RPC URL:</strong> {getCurrentRpcUrl()}</div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="custom" className="space-y-4 mt-4">
              <div className="grid gap-2">
                <Label htmlFor="customRpc">Custom RPC URL</Label>
                <Input
                  id="customRpc"
                  placeholder="https://rpc.example.com"
                  value={customRpcUrl}
                  onChange={(e) => setCustomRpcUrl(e.target.value)}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Enter the RPC endpoint URL for your desired network.
                </p>
              </div>
            </TabsContent>

            {error && (
              <div className="text-sm text-destructive mt-2 p-2 bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || (activeTab === "predefined" && !selectedNetwork)}
              >
                {isSubmitting ? "Connecting..." : "Connect"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}