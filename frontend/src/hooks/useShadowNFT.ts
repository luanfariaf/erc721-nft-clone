import { useState, useCallback } from "react";
import { ethers } from "ethers";
import shadowNftArtifact from "@/abi/ShadowNFT.json";
import { toast } from "sonner";

const CONTRACT_ADDRESS = import.meta.env.CONTRACT_DEPLOYED_TO!;
const abi = shadowNftArtifact.abi;

export default function useShadowNFT() {
  const [address, setAddress] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      toast.error("Metamask not installed.");
      return;
    }
    const desiredChain = "0x13882"; // Amoy
    const currentChain = await window.ethereum.request({ method: "eth_chainId" });
    if (currentChain !== desiredChain) {
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: desiredChain }],
        });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        if (err.code === 4902) {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: desiredChain,
              chainName: "Polygon Amoy Testnet",
              nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
              rpcUrls: ["https://rpc-amoy.polygon.technology"],
              blockExplorerUrls: ["https://www.oklink.com/amoy"],
            }],
          });
        } else {
          toast.error("Error on change network");
          return;
        }
      }
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    setAddress(userAddress);
    setContract(new ethers.Contract(CONTRACT_ADDRESS, abi, signer));
  }, []);

  const mintNFT = useCallback(
    async (uri: string) => {
      if (!contract) return;
      const tx = await contract.mintClone(uri);
      await tx.wait();
      toast.success("NFT minted with success!");
    },
    [contract]
  );

  const burnNFT = useCallback(
    async (tokenId: number) => {
      if (!contract) return;
      const tx = await contract.burn(tokenId);
      await tx.wait();
      toast.success("NFT burned with success!");
    },
    [contract]
  );

  const getMyTokens = useCallback(async (): Promise<number[]> => {
    if (!contract) return [];
    const tokensRaw = await contract.getMyTokens() as bigint[];
    return tokensRaw.map((t) => Number(t));
  }, [contract]);

  return {
    connect,
    address,
    mintNFT,
    burnNFT,
    getMyTokens,
    connected: !!address,
    contract,
  };
}