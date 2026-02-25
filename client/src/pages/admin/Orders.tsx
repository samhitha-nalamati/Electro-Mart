import { AdminLayout } from "@/components/layout/AdminLayout";
import { useAllOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export default function AdminOrders() {
  const { data: orders, isLoading } = useAllOrders();
  const updateStatus = useUpdateOrderStatus();
  const { toast } = useToast();

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate({ id, status }, {
      onSuccess: () => toast({ title: "Status Updated", description: `Order #${id} is now ${status}.` })
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Orders</h1>
          <p className="text-muted-foreground">Manage customer orders and fulfillment.</p>
        </div>

        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer ID</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.sort((a,b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()).map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono">#{order.id.toString().padStart(6, '0')}</TableCell>
                  <TableCell>{format(new Date(order.createdAt!), 'MMM d, yyyy')}</TableCell>
                  <TableCell>User {order.userId}</TableCell>
                  <TableCell className="font-bold text-primary">${Number(order.totalPrice).toFixed(2)}</TableCell>
                  <TableCell>{order.items?.length || 0} items</TableCell>
                  <TableCell>
                    <Select defaultValue={order.status} onValueChange={(val) => handleStatusChange(order.id, val)}>
                      <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Confirmed">Confirmed</SelectItem>
                        <SelectItem value="Shipped">Shipped</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
