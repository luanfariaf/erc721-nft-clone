import { useState } from "react";
import { ethers } from "ethers";
import shadowNftArtifact from "@/abi/ShadowNFT.json";
import { toast } from "sonner";

const CONTRACT_ADDRESS = process.env.CONTRACT_DEPLOYED_TO;
const abi = shadowNftArtifact.abi;

export default function useShadowNFT() {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(false);

  const connect = async () => {
    if (!window.ethereum) {
      toast("Metamask não instalada.");
      return;
    }
  
    const polygonAmoyChainId = "0x13882";
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: polygonAmoyChainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: polygonAmoyChainId,
              chainName: "Polygon Amoy Testnet",
              nativeCurrency: {
                name: "MATIC",
                symbol: "MATIC",
                decimals: 18,
              },
              rpcUrls: ["https://rpc-amoy.polygon.technology"],
              blockExplorerUrls: ["https://www.oklink.com/amoy"],
            },
          ],
        });
      } else {
        console.error("Erro ao trocar de rede:", switchError);
        toast.error("Erro ao trocar de rede");
        return;
      }
    }
  
    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    const signer = await browserProvider.getSigner();
    const userAddress = await signer.getAddress();
  
    const nftContract = new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
  
    setAddress(userAddress);
    setProvider(browserProvider);
    setContract(nftContract);
  };  

  const mintNFT = async (uri: string) => {
    
    console.log("mintNFT");
    if (!contract) return;
    console.log("mintNFT has contract")
    console.log("Signer do contrato:", contract.signer);
    setLoading(true);
    try {
      console.log("mintNFT try")
      const tx = await contract.mintClone(uri);
      await tx.wait();
      toast.success("NFT minted with success!");
    } catch (e) {
      console.error(e);
      toast.error("Error on mint NFT.");
    } finally {
      console.log("mintNFT finally")
      setLoading(false);
    }
  };

  const burnNFT = async (tokenId: number) => {
    if (!contract) return;
    setLoading(true);
    try {
      const tx = await contract.burn(tokenId);
      await tx.wait();
      toast.success("NFT burned with success!");
    } catch (e) {
      console.error(e);
      toast.error("Error on burn NFT.");
    } finally {
      setLoading(false);
    }
  };

  const getMyTokens = async (): Promise<number[]> => {
    if (!contract) return [];
    try {
      const tokens: ethers.BigNumberish[] = await contract.getMyTokens();
      return tokens.map((t) => Number(t));
    } catch (e) {
      console.error("Error on search NFTs:", e);
      return [];
    }
  };

  return {
    connect,
    address,
    mintNFT,
    burnNFT,
    getMyTokens,
    loading,
    connected: !!address,
    contract,
  };
}