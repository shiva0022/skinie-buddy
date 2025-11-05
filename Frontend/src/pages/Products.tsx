import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Navigation from "@/components/Navigation";
import FloatingChatWidget from "@/components/FloatingChatWidget";
import TopNav from "@/components/TopNav";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { productsAPI } from "@/services/api";

const Products = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newProduct, setNewProduct] = useState({ 
    name: "", 
    brand: "", 
    type: "", 
    usage: "both",
    compatibility: "good" as const
  });

  // Fetch products from API
  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await productsAPI.getAll();
      return response.data?.products || [];
    }
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: (productData: any) => productsAPI.create(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Product added successfully!");
      setDialogOpen(false);
      setNewProduct({ name: "", brand: "", type: "", usage: "both", compatibility: "good" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add product");
    }
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => productsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success("Product deleted successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete product");
    }
  });

  const products = productsData || [];

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.brand || !newProduct.type) {
      toast.error("Please fill in all fields");
      return;
    }
    createMutation.mutate(newProduct);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteMutation.mutate(id);
    }
  };

  // Filter products based on search
  const filteredProducts = products.filter((product: any) => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-subtle pb-20 pt-16">
      <TopNav />
      <div className="max-w-screen-lg mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Product Bag</h1>
          <p className="text-muted-foreground">Manage your skincare collection</p>
        </div>

        {/* Search and Add */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-10 bg-card border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g., Gentle Cleanser"
                  />
                </div>
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    placeholder="e.g., CeraVe"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newProduct.type}
                    onValueChange={(value) => setNewProduct({ ...newProduct, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cleanser">Cleanser</SelectItem>
                      <SelectItem value="Toner">Toner</SelectItem>
                      <SelectItem value="Serum">Serum</SelectItem>
                      <SelectItem value="Moisturizer">Moisturizer</SelectItem>
                      <SelectItem value="Sunscreen">Sunscreen</SelectItem>
                      <SelectItem value="Treatment">Treatment</SelectItem>
                      <SelectItem value="Mask">Mask</SelectItem>
                      <SelectItem value="Eye Cream">Eye Cream</SelectItem>
                      <SelectItem value="Exfoliant">Exfoliant</SelectItem>
                      <SelectItem value="Oil">Oil</SelectItem>
                      <SelectItem value="Essence">Essence</SelectItem>
                      <SelectItem value="Hydrator">Hydrator</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleAddProduct} 
                  className="w-full"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Adding..." : "Add Product"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive mb-4">Failed to load products</p>
            <Button onClick={() => queryClient.invalidateQueries({ queryKey: ['products'] })}>
              Retry
            </Button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-2">
              {searchQuery ? "No products match your search" : "No products yet"}
            </p>
            {!searchQuery && (
              <p className="text-sm text-muted-foreground">
                Click "Add Product" to get started!
              </p>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product: any) => (
              <ProductCard
                key={product._id}
                name={product.name}
                brand={product.brand}
                type={product.type}
                compatibility={product.compatibility}
                onRemove={() => handleDeleteProduct(product._id)}
              />
            ))}
          </div>
        )}
      </div>

      <FloatingChatWidget />
      <Navigation />
    </div>
  );
};

export default Products;
