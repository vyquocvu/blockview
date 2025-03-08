import { useState } from "react";
import { updateRpcUrl } from "../lib/blockchain";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useNetwork } from "../context/NetworkContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface RpcUrlDialogProps {
  onUpdate: () => void;
}

export function RpcUrlDialog({ onUpdate }: RpcUrlDialogProps) {
  const { setRpcUrl } = useNetwork();
  const [open, setOpen] = useState(false);
  const [newRpcUrl, setNewRpcUrl] = useState(
    localStorage.getItem("custom_rpc_url") || "https://rpc.viction.xyz"
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate URL format
      new URL(newRpcUrl);
      
      // Update the RPC URL
      await updateRpcUrl(newRpcUrl);
      setRpcUrl(newRpcUrl);
      
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Change RPC
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change RPC URL</DialogTitle>
          <DialogDescription>
            Enter a custom RPC URL to connect to a different network.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="rpcUrl"
                placeholder="https://rpc.example.com"
                value={newRpcUrl}
                onChange={(e) => setNewRpcUrl(e.target.value)}
                className="w-full"
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}