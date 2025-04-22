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
import { PlusIcon } from "lucide-react";
import useShadowNFT from "@/hooks/useShadowNFT";
import { MOCK_NFTS } from "./mock/mock-nfts";

const App = () => {
  const { connect, burnNFT, mintNFT, getMyTokens, connected, contract } = useShadowNFT();
  const [activeTab, setActiveTab] = useState("collection");
  const [mintURI, setMintURI] = useState("");
  const [minting, setMinting] = useState(false);
  const [userNFTs, setUserNFTs] = useState<{ tokenId: number; uri: string }[]>([]);

  // Connect on load
  useEffect(() => {
    connect();
  }, [connect]);

  // Load NFTs when connected
  useEffect(() => {
    if (!connected || !contract) return;
    (async () => {
      const tokenIds = await getMyTokens();
      const nfts = await Promise.all(
        tokenIds.map(async (tokenId) => {
          try {
            const uri = await contract.tokenURI(tokenId);
            return { tokenId, uri };
          } catch {
            return null;
          }
        })
      );
      setUserNFTs(nfts.filter(Boolean) as { tokenId: number; uri: string }[]);
    })();
  }, [connected, contract, getMyTokens]);

  const handleMint = async () => {
    if (!mintURI) return;
    setMinting(true);
    try {
      await mintNFT(mintURI);
      setMintURI("");
    } finally {
      setMinting(false);
    }
  };

  const handleBurn = async (id: number) => {
    await burnNFT(id);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Mint Dialog */}
        <div className="flex justify-end mb-8">
          <Dialog>
            <DialogTrigger>
              <Button>Add new NFT</Button>
            </DialogTrigger>
            <DialogContent className="bg-background">
              <DialogHeader>
                <DialogTitle>Add NFT</DialogTitle>
                <DialogDescription>
                  Paste image URI (IPFS, OpenSea, etc.)
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <Input
                  id="link"
                  value={mintURI}
                  placeholder="Enter URI"
                  className="bg-background text-foreground border border-border flex-1"
                  onChange={(e) => setMintURI(e.target.value)}
                />
                <Button
                  size="sm"
                  disabled={minting || !mintURI}
                  onClick={handleMint}
                >
                  {minting ? "..." : <PlusIcon />}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="collection" className="mb-8">
          <TabsList className="bg-muted text-foreground border border-border">
            <TabsTrigger
              className="data-[state=active]:bg-primary data-[state=active]:text-white"
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

        {/* NFT Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "owned"
            ? userNFTs.map((nft) => (
                <NFTCard
                  key={nft.tokenId}
                  image={nft.uri}
                  title={`NFT #${nft.tokenId}`}
                  price="FREE"
                  likes={0}
                  onBurn={() => handleBurn(nft.tokenId)}
                />
              ))
            : MOCK_NFTS.map((nft) => (
                <NFTCard
                  key={nft.id}
                  image={nft.image}
                  title={nft.title}
                  price={nft.price}
                  likes={nft.likes}
                />
              ))}
        </div>
      </main>
    </div>
  );
};

export default App;