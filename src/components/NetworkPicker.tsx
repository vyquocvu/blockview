import { useState, useEffect } from "react";
import { updateRpcUrl } from "../lib/blockchain";
import { useNetwork } from "../context/NetworkContext";
import { PREDEFINED_NETWORKS, NetworkConfig } from "../lib/networks";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface NetworkPickerProps {
  onUpdate: () => void;
}

export function NetworkPicker({ onUpdate }: NetworkPickerProps) {
  const { setRpcUrl, rpcUrl } = useNetwork();
  const [selectedNetwork, setSelectedNetwork] = useState<string>("");
  const [isChanging, setIsChanging] = useState(false);

  // Find the currently selected network based on RPC URL
  useEffect(() => {
    if (rpcUrl) {
      const network = Object.entries(PREDEFINED_NETWORKS).find(([_, config]) =>
        config.rpcUrls.some(url => url === rpcUrl)
      );
      if (network) {
        setSelectedNetwork(network[0]);
      }
    }
  }, [rpcUrl]);

  const handleNetworkChange = async (networkId: string) => {
    if (isChanging || networkId === selectedNetwork) return;

    setIsChanging(true);
    try {
      const network = PREDEFINED_NETWORKS[networkId];
      if (network) {
        const newRpcUrl = network.rpcUrls[0];
        await updateRpcUrl(newRpcUrl);
        setRpcUrl(newRpcUrl);
        setSelectedNetwork(networkId);
        onUpdate();
      }
    } catch (error) {
      console.error("Error changing network:", error);
    } finally {
      setIsChanging(false);
    }
  };

  // Group networks by mainnet/testnet
  const mainnetNetworks = Object.entries(PREDEFINED_NETWORKS).filter(
    ([_, config]) => config.type === "mainnet"
  );
  const testnetNetworks = Object.entries(PREDEFINED_NETWORKS).filter(
    ([_, config]) => config.type === "testnet"
  );

  return (
    <Select
      value={selectedNetwork}
      onValueChange={handleNetworkChange}
      disabled={isChanging}
    >
      <SelectTrigger className="w-[280px]">
        <SelectValue placeholder="Select Network">
          {selectedNetwork && (
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {PREDEFINED_NETWORKS[selectedNetwork]?.logo}
              </span>
              <span>{PREDEFINED_NETWORKS[selectedNetwork]?.name}</span>
              <span className="text-xs text-muted-foreground">
                ({PREDEFINED_NETWORKS[selectedNetwork]?.nativeCurrency.symbol})
              </span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {mainnetNetworks.length > 0 && (
          <SelectGroup>
            <SelectLabel>Mainnet</SelectLabel>
            {mainnetNetworks.map(([id, network]) => (
              <SelectItem key={id} value={id}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{network.logo}</span>
                  <span>{network.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({network.nativeCurrency.symbol})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
        {testnetNetworks.length > 0 && (
          <SelectGroup>
            <SelectLabel>Testnet</SelectLabel>
            {testnetNetworks.map(([id, network]) => (
              <SelectItem key={id} value={id}>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{network.logo}</span>
                  <span>{network.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({network.nativeCurrency.symbol})
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        )}
      </SelectContent>
    </Select>
  );
}
