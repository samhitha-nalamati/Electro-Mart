import { Navbar } from "@/components/layout/Navbar";
import { useMyOrders } from "@/hooks/use-orders";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, CheckCircle2, Truck, Home } from "lucide-react";
import { format } from "date-fns";

const statusConfig: Record<string, { icon: any, color: string }> = {
  'Pending': { icon: Clock, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' },
  'Confirmed': { icon: CheckCircle2, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
  'Shipped': { icon: Truck, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
  'Delivered': { icon: Home, color: 'bg-green-500/10 text-green-500 border-green-500/20' },
};

export default function OrderHistory() {
  const { data: orders, isLoading } = useMyOrders();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-display font-bold mb-8 flex items-center gap-3">
          <Package className="w-8 h-8 text-primary" /> Order History
        </h1>

        {isLoading ? (
          <div className="flex justify-center"><Package className="w-8 h-8 animate-bounce text-primary" /></div>
        ) : orders?.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border/50">
            <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-2xl font-bold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground">When you buy something, it will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders?.sort((a,b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()).map(order => {
              const StatusIcon = statusConfig[order.status]?.icon || Clock;
              return (
                <div key={order.id} className="bg-card border border-border/50 rounded-2xl overflow-hidden">
                  <div className="bg-muted/30 p-4 border-b border-border/50 flex flex-wrap justify-between items-center gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Order Placed</p>
                      <p className="font-medium">{format(new Date(order.createdAt!), 'MMM d, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Total</p>
                      <p className="font-medium text-primary">${Number(order.totalPrice).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-1">Order #</p>
                      <p className="font-mono text-sm">{order.id.toString().padStart(6, '0')}</p>
                    </div>
                    <div>
                      <Badge className={`px-3 py-1 flex items-center gap-1 border ${statusConfig[order.status]?.color || 'bg-secondary'}`}>
                        <StatusIcon className="w-3 h-3" />
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.product.image || "https://images.unsplash.com/photo-1550009158-9effb6e9bb41?w=100&h=100&fit=crop"} alt={item.product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold">{item.product.name}</h4>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity} × ${Number(item.priceAtTime).toFixed(2)}</p>
                        </div>
                        <div className="font-bold">
                          ${(Number(item.priceAtTime) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
