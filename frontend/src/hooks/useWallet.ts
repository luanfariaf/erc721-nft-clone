import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      const BrowserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await BrowserProvider.send("eth_requestAccounts", []);
      setAddress(accounts[0]);
      setProvider(BrowserProvider);
    } else {
      toast("Metamask is not installed");
    }
  };

  useEffect(() => {
    (async () => {
      if (window.ethereum) {
        const BrowserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await BrowserProvider.listAccounts();
        if (accounts.length > 0) {
          setAddress(accounts[0].address);
          setProvider(BrowserProvider);
        }
      }
    })();
  }, []);

  return { address, provider, connectWallet };
}