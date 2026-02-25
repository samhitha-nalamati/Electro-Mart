import { Navbar } from "@/components/layout/Navbar";
import { useCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function Cart() {
  const { data: cartItems, isLoading } = useCart();
  const updateCart = useUpdateCartItem();
  const removeCart = useRemoveFromCart();
  const clearCart = useClearCart();
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const total = cartItems?.reduce((acc, item) => acc + (Number(item.product.price) * item.quantity), 0) || 0;

  const handleCheckout = () => {
    createOrder.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Order Confirmed!", description: "Your order has been placed successfully." });
        clearCart.mutate();
        setLocation('/orders');
      },
      onError: (err) => {
        toast({ title: "Checkout failed", description: err.message, variant: "destructive" });
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-display font-bold mb-8 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-primary" /> Your Cart
        </h1>

        {isLoading ? (
          <div className="flex justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : cartItems?.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border/50">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Looks like you haven't added anything yet.</p>
            <Link href="/">
              <Button size="lg">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems?.map(item => (
                <div key={item.id} className="flex gap-4 p-4 bg-card border border-border/50 rounded-2xl items-center">
                  <div className="w-24 h-24 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.product.image || "https://images.unsplash.com/photo-1550009158-9effb6e9bb41?w=200&h=200&fit=crop"} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{item.product.name}</h3>
                    <p className="text-primary font-bold">${Number(item.product.price).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3 bg-background border border-border rounded-lg p-1">
                    <Button 
                      variant="ghost" size="icon" className="w-8 h-8 rounded-md hover:bg-muted"
                      onClick={() => updateCart.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                      disabled={item.quantity <= 1 || updateCart.isPending}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="font-medium w-4 text-center">{item.quantity}</span>
                    <Button 
                      variant="ghost" size="icon" className="w-8 h-8 rounded-md hover:bg-muted"
                      onClick={() => updateCart.mutate({ id: item.id, quantity: Math.min(item.product.stock, item.quantity + 1) })}
                      disabled={item.quantity >= item.product.stock || updateCart.isPending}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => removeCart.mutate(item.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border/50 rounded-3xl p-6 h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              <div className="space-y-4 mb-6 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({cartItems?.length} items)</span>
                  <span className="font-medium">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-green-500">Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">Calculated at checkout</span>
                </div>
                <div className="pt-4 border-t border-border/50 flex justify-between items-center">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-display font-bold text-3xl text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
              
              <Button 
                size="lg" 
                className="w-full text-lg py-6 shadow-lg shadow-primary/20"
                onClick={handleCheckout}
                disabled={createOrder.isPending}
              >
                {createOrder.isPending ? "Processing..." : "Complete Checkout"} 
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
