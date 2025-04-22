import { User, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useWallet from "@/hooks/useWallet";

const Header = () => {
  const { address, connectWallet } = useWallet();

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/"className="text-xl font-bold">ShadowNFT</a>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" className="flex items-center gap-2" onClick={connectWallet}>
            <Wallet className="h-4 w-4" />
            { address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Connect Wallet" }
          </Button>
          
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="User" />
            <AvatarFallback><User /></AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
};

export default Header;