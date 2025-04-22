// App.tsx
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import NFTCard from "@/components/NFTCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { PlusIcon } from "lucide-react";
import useShadowNFT from "@/hooks/useShadowNFT";
import { MOCK_NFTS } from "./mock/mock-nfts";

const App = () => {
  const {
    connect,
    address,
    burnNFT,
    mintNFT,
    getMyTokens,
    connected,
    loading,
    contract,
  } = useShadowNFT();

  const [activeTab, setActiveTab] = useState("collection");
  const [mintURI, setMintURI] = useState("");
  const [minting, setMinting] = useState(false);
  const [userNFTs, setUserNFTs] = useState<{
    tokenId: number;
    uri: string;
  }[]>([]);

  useEffect(() => {
    connect();
  }, [connect]);
  

  const handleBurnNFT = async (tokenId: number) => {
    await burnNFT(tokenId);
    await loadNFTs();
  };

  const handleMint = async () => {
    console.log("handleMint executed");
    if (!mintURI) return;
    console.log("handleMint has mintURI");
    setMinting(true);
    try {
      console.log("handleMint try");
      await mintNFT(mintURI);
      await loadNFTs();
      setMintURI("");
    } catch(error) {
      console.error("error on minting", error);
    } finally {
      setMinting(false);
    }
  };

  const loadNFTs = async () => {
    if (!connected || !contract) return;

    const tokenIds = await getMyTokens();

    const nfts = await Promise.all(
      tokenIds.map(async (tokenId) => {
        try {
          const uri = await contract.tokenURI(tokenId);
          return { tokenId, uri };
        } catch (e) {
          console.error(`Error on search token URI ${tokenId}`, e);
          return null;
        }
      })
    );

    setUserNFTs(nfts.filter(Boolean) as { tokenId: number; uri: string }[]);
  };

  useEffect(() => {
    if (connected) {
      loadNFTs();
    }
    
    if(!connected) {
      connect();
    }

  }, [connected]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8 justify-end">
          <Dialog>
            <DialogTrigger>
              Add new NFT
            </DialogTrigger>
            <DialogContent className="bg-background">
              <DialogHeader>
                <DialogTitle>Add new NFT to your collection</DialogTitle>
                <DialogDescription>
                  Paste a valid image URI (e.g., from OpenSea or IPFS)
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-4 justify-end bg-muted p-4 rounded-lg">
                <div className="grid flex-1 gap-2">
                  <Label htmlFor="link" className="sr-only">
                    Link
                  </Label>
                  <Input
                    id="link"
                    value={mintURI}
                    placeholder="Paste the URI of the NFT (ex: IPFS or metadata JSON)"
                    className="bg-background text-foreground border border-border"
                    onChange={(e) => setMintURI(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-primary text-white hover:bg-primary/90"
                  disabled={minting || !mintURI}
                  onClick={handleMint}
                >
                  {minting ? (
                    "..."
                  ) : (
                    <>
                      <span className="sr-only">Add</span>
                      <PlusIcon />
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="collection" className="w-full mb-8">
          <TabsList className="justify-start gap-2 bg-muted text-foreground border border-border">
            <TabsTrigger
              className="w-40 data-[state=active]:bg-primary data-[state=active]:text-white"
              value="collection"
              onClick={() => setActiveTab("collection")}
            >
              Collections
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
              value="owned"
              onClick={() => setActiveTab("owned")}
            >
              Owned
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "owned"
            ? userNFTs.map((nft) => (
                <NFTCard
                  key={nft.tokenId}
                  image={nft.uri}
                  title={`NFT #${nft.tokenId}`}
                  price="FREE"
                  likes={0}
                  onBurn={() => handleBurnNFT(nft.tokenId)}
                />
              ))
            : MOCK_NFTS.map((nft) => (
                <NFTCard
                  key={nft.id}
                  image={nft.image}
                  title={nft.title}
                  price={nft.price}
                  likes={nft.likes}
                  onBurn={() => handleBurnNFT(nft.id)}
                />
              ))}
        </div>
      </main>
    </div>
  );
};

export default App;
