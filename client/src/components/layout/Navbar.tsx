import { Link } from "wouter";
import { ShoppingCart, Package, UserCircle, LogOut, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, logout } = useAuth();
  const { data: cart } = useCart();

  const cartCount = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display font-bold text-xl text-foreground tracking-tight">ElectroMart</span>
          </Link>
        </div>

        <nav className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" className="hidden sm:flex text-muted-foreground hover:text-foreground">Store</Button>
          </Link>

          {user ? (
            <>
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/orders">
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                  <Package className="w-5 h-5" />
                </Button>
              </Link>
              {user.role === 'admin' && (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="hidden md:flex border-primary/20 text-primary hover:bg-primary/10">
                    Admin Dashboard
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground hover:text-destructive">
                <LogOut className="w-5 h-5" />
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                <UserCircle className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
