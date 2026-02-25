import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", ...Array.from(new Set(products?.map(p => p.category) || []))];

  const filteredProducts = products?.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] -z-10 pointer-events-none" />

      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-16 space-y-6">
          <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 px-4 py-1.5 text-sm">
            Next Generation Hardware
          </Badge>
          <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight">
            The Future of <span className="text-gradient">Electronics</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover premium devices, accessories, and components engineered for tomorrow.
          </p>

          <div className="max-w-md mx-auto relative mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-6 bg-card border-border/50 rounded-2xl text-lg shadow-xl shadow-black/50 focus-visible:ring-primary/20 focus-visible:border-primary"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                className={`rounded-full ${activeCategory !== cat && "bg-card border-border/50 text-muted-foreground hover:text-foreground"}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </section>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : filteredProducts?.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border/50">
            <h3 className="text-2xl font-bold text-foreground">No products found</h3>
            <p className="text-muted-foreground mt-2">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts?.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
