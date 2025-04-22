import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, X } from "lucide-react";

interface NFTCardProps {
  image: string;
  title: string;
  price: string;
  likes: number;
  onBurn?: () => void;
}

const NFTCard = ({ image, title, price, likes, onBurn }: NFTCardProps) => {
  return (
    <Card className="overflow-hidden pt-0 bg-muted text-foreground border border-border">
      <CardContent className="p-0">
        <img 
          src={image} 
          alt={title}
          className="w-full h-[400px] object-cover hover:scale-105 transition-transform"
        />
      </CardContent>
      <CardFooter className="flex flex-col gap-2 p-4">
        <div className="flex items-center justify-between w-full">
          <h3 className="font-medium">{title}</h3>
          <span className="text-sm text-accent">{price} ETH</span>
        </div>
        <div className="flex items-center justify-between w-full">
          <Button variant="ghost" size="sm" className="flex items-center gap-1 text-accent hover:text-pink-400">
            <Heart className="h-4 w-4" />
            {likes}
          </Button>
          {onBurn && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onBurn}
              className="flex items-center gap-1 text-accent hover:text-pink-400"
            >
              <X className="h-4 w-4" />
              Burn
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default NFTCard;