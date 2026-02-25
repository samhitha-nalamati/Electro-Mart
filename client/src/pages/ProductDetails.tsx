import { useParams } from "wouter";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useProduct } from "@/hooks/use-products";
import { useProductReviews, useCreateReview } from "@/hooks/use-reviews";
import { useAddToCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Star, ShoppingCart, ArrowLeft, Send } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function ProductDetails() {
  const { id } = useParams();
  const productId = parseInt(id || "0");
  
  const { data: product, isLoading: productLoading } = useProduct(productId);
  const { data: reviews, isLoading: reviewsLoading } = useProductReviews(productId);
  const addToCart = useAddToCart();
  const createReview = useCreateReview();
  const { user } = useAuth();
  const { toast } = useToast();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  if (productLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center text-xl text-muted-foreground">Product not found</div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart.mutate({ productId, quantity: 1 }, {
      onSuccess: () => toast({ title: "Added to cart", description: `${product.name} added.` })
    });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    createReview.mutate({ productId, rating, comment }, {
      onSuccess: () => {
        toast({ title: "Review posted", description: "Thank you for your feedback!" });
        setComment("");
        setRating(5);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/">
          <Button variant="ghost" className="mb-6 text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Store
          </Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="rounded-3xl overflow-hidden border border-border/50 bg-card aspect-square relative shadow-2xl">
            {/* product device tech abstract modern */}
            <img 
              src={product.image || "https://images.unsplash.com/photo-1550009158-9effb6e9bb41?w=800&h=800&fit=crop"} 
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-primary/10 text-primary border-none">{product.category}</Badge>
              <div className="flex items-center gap-1 text-sm font-medium bg-accent/10 text-accent px-2 py-1 rounded-full">
                <Star className="w-4 h-4 fill-accent" />
                {Number(product.averageRating).toFixed(1)} Rating
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground">{product.name}</h1>
            <p className="text-4xl font-bold text-primary mb-6">${Number(product.price).toFixed(2)}</p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">{product.description}</p>

            <div className="bg-card border border-border/50 rounded-2xl p-6 mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Availability</p>
                <p className={`font-bold text-lg ${product.stock > 0 ? 'text-green-500' : 'text-destructive'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                </p>
              </div>
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 rounded-xl shadow-lg shadow-primary/20"
                disabled={product.stock <= 0 || addToCart.isPending}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                {addToCart.isPending ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="max-w-4xl border-t border-border/50 pt-12">
          <h2 className="text-3xl font-display font-bold mb-8">Customer Reviews</h2>
          
          {user ? (
            <form onSubmit={handleReviewSubmit} className="bg-card border border-border/50 p-6 rounded-2xl mb-10">
              <h3 className="font-bold mb-4">Write a Review</h3>
              <div className="flex items-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star} 
                    className={`w-6 h-6 cursor-pointer transition-colors ${rating >= star ? 'fill-accent text-accent' : 'text-muted-foreground'}`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
              <Textarea 
                placeholder="Share your experience with this product..." 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mb-4 bg-background border-border"
                rows={4}
              />
              <Button type="submit" disabled={createReview.isPending}>
                {createReview.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                Post Review
              </Button>
            </form>
          ) : (
            <div className="bg-card border border-border/50 p-6 rounded-2xl mb-10 flex justify-between items-center">
              <p className="text-muted-foreground">Log in to share your thoughts.</p>
              <Link href="/auth"><Button variant="outline">Sign In</Button></Link>
            </div>
          )}

          {reviewsLoading ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          ) : reviews?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews?.map(review => (
                <div key={review.id} className="bg-card border border-border/50 p-6 rounded-2xl">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-accent text-accent' : 'text-muted'}`} />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">{format(new Date(review.createdAt!), 'MMM d, yyyy')}</span>
                  </div>
                  <p className="text-foreground">{review.comment}</p>
                  <div className="mt-3 inline-block px-2 py-1 rounded bg-background border border-border text-xs text-muted-foreground">
                    AI Sentiment: <span className={review.sentiment === 'positive' ? 'text-green-500' : review.sentiment === 'negative' ? 'text-destructive' : 'text-yellow-500'}>{review.sentiment}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
