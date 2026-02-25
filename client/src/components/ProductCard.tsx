import { Link, useLocation } from "wouter";
import { Star, ShoppingCart } from "lucide-react";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAddToCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function ProductCard({ product }: { product: Product }) {
  const addToCart = useAddToCart();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in", description: "You need an account to add items to cart." });
      setLocation('/auth');
      return;
    }
    addToCart.mutate({ productId: product.id, quantity: 1 }, {
      onSuccess: () => {
        toast({ title: "Added to cart", description: `${product.name} was added to your cart.` });
      }
    });
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <Link href={`/product/${product.id}`}>
      <div className="group bg-card rounded-2xl border border-border/50 overflow-hidden hover-elevate cursor-pointer flex flex-col h-full relative">
        {/* Placeholder image logic, using Unsplash tech images */}
        {/* product photography technology modern */}
        <div className="aspect-square relative bg-muted/20 overflow-hidden">
          <img 
            src={product.image || `https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&h=600&fit=crop`} 
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
              <Badge variant="destructive" className="text-sm px-3 py-1 font-bold">OUT OF STOCK</Badge>
            </div>
          )}
          <div className="absolute top-3 right-3">
             <Badge className="bg-background/80 backdrop-blur text-foreground border-white/10">
               {product.category}
             </Badge>
          </div>
        </div>

        <div className="p-5 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-display font-bold text-lg text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>
          </div>
          
          <div className="flex items-center gap-1 mb-3">
            <Star className="w-4 h-4 fill-accent text-accent" />
            <span className="text-sm font-medium">{Number(product.averageRating).toFixed(1)}</span>
          </div>

          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1">
            {product.description}
          </p>

          <div className="flex items-center justify-between mt-auto">
            <span className="text-2xl font-bold text-foreground">
              ${Number(product.price).toFixed(2)}
            </span>
            <Button 
              size="icon" 
              className={`rounded-xl shadow-lg ${isOutOfStock ? 'opacity-50' : 'hover:scale-105 active:scale-95 transition-transform'}`}
              disabled={isOutOfStock || addToCart.isPending}
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
