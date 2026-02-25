import { useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { useProducts, useCreateProduct, useDeleteProduct, useUpdateProduct } from "@/hooks/use-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminProducts() {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  
  // Form State
  const [formData, setFormData] = useState({
    name: "", price: "", description: "", category: "", image: "", stock: ""
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const resetForm = () => {
    setFormData({ name: "", price: "", description: "", category: "", image: "", stock: "" });
    setEditingId(null);
  };

  const handleEdit = (p: any) => {
    setFormData({
      name: p.name, price: p.price, description: p.description, 
      category: p.category, image: p.image, stock: p.stock.toString()
    });
    setEditingId(p.id);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: formData.price, // Sent as string to match numeric schema
      stock: parseInt(formData.stock)
    };

    if (editingId) {
      updateProduct.mutate({ id: editingId, updates: payload }, {
        onSuccess: () => {
          toast({ title: "Updated", description: "Product updated successfully." });
          setIsOpen(false);
          resetForm();
        }
      });
    } else {
      createProduct.mutate(payload as any, {
        onSuccess: () => {
          toast({ title: "Created", description: "Product created successfully." });
          setIsOpen(false);
          resetForm();
        }
      });
    }
  };

  const filteredProducts = products?.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your store inventory.</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20"><Plus className="w-4 h-4 mr-2"/> Add Product</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card border-border">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-background"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Price ($)</label>
                    <Input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-background"/>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stock</label>
                    <Input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="bg-background"/>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Input required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="bg-background"/>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Image URL</label>
                    <Input required value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} className="bg-background"/>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-background"/>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createProduct.isPending || updateProduct.isPending}>
                  {createProduct.isPending || updateProduct.isPending ? 'Saving...' : 'Save Product'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search products..." 
            value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-card border-border/50"
          />
        </div>

        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    <img src={product.image} alt={product.name} className="w-10 h-10 rounded bg-muted object-cover" />
                    {product.name}
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>${Number(product.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={product.stock <= 0 ? 'text-destructive font-bold' : ''}>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(product)} className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => {
                      if(confirm('Delete product?')) deleteProduct.mutate(product.id);
                    }} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
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
