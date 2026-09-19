import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit?: any | null; // If null, it's add mode
}

export function ProductFormDialog({ open, onOpenChange, productToEdit }: ProductFormDialogProps) {
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "",
    price: "",
    mrp: "",
    image: "",
    description: "",
    stock: "0"
  });

  useEffect(() => {
    if (productToEdit) {
      setForm({
        name: productToEdit.name || "",
        slug: productToEdit.slug || "",
        category: productToEdit.category || "",
        price: productToEdit.price?.toString() || "",
        mrp: productToEdit.mrp?.toString() || "",
        image: productToEdit.image || "",
        description: productToEdit.description || "",
        // For editing, we don't handle stock in this form (we can handle it in the inventory tab directly)
        // But if we want to show it, we could. The requirement says "The admin should also be able to update stock from Products & Inventory."
        // We'll leave stock disabled in edit mode, or handle it separately.
        stock: "0"
      });
    } else {
      setForm({
        name: "",
        slug: "",
        category: "",
        price: "",
        mrp: "",
        image: "",
        description: "",
        stock: "0"
      });
    }
    setImageFile(null);
  }, [productToEdit, open]);

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      let finalImageUrl = data.image.trim();

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, imageFile);
          
        if (uploadError) throw new Error("Image upload failed: " + uploadError.message);
        
        const { data: publicUrlData } = supabase.storage
          .from("products")
          .getPublicUrl(fileName);
          
        finalImageUrl = publicUrlData.publicUrl;
      }

      if (productToEdit) {
        // Edit mode
        const { error } = await supabase
          .from("products")
          .update({
            name: data.name.trim(),
            slug: data.slug.trim(),
            category: data.category.trim(),
            price: parseFloat(data.price),
            mrp: parseFloat(data.mrp),
            image: finalImageUrl,
            description: data.description.trim(),
            updated_at: new Date().toISOString()
          } as never)
          .eq("id", productToEdit.id);
        if (error) throw error;
      } else {
        // Add mode
        const productPayload = {
          name: data.name.trim(),
          slug: data.slug.trim(),
          category: data.category.trim(),
          price: parseFloat(data.price),
          mrp: parseFloat(data.mrp),
          image: finalImageUrl,
          description: data.description.trim(),
        };

        // Try using the RPC if it was successfully applied by the user
        // We will try the RPC first, and if it fails because it doesn't exist, we fallback to 2-step.
        let productId;
        const { data: rpcData, error: rpcError } = await supabase.rpc("create_product_with_inventory", {
          p_slug: productPayload.slug,
          p_name: productPayload.name,
          p_category: productPayload.category,
          p_price: productPayload.price,
          p_mrp: productPayload.mrp,
          p_image: productPayload.image,
          p_description: productPayload.description,
          p_stock: parseInt(data.stock, 10),
          p_variant: "Default"
        } as any);

        if (!rpcError) {
           // Success using RPC
           return;
        }

        // Fallback to 2-step process if RPC not found or failed for other reasons
        const { data: productData, error: productError } = await supabase
          .from("products")
          .insert(productPayload as never)
          .select("id")
          .single();

        if (productError) throw productError;
        productId = (productData as any).id;

        const { error: invError } = await supabase
          .from("inventory")
          .insert({
            product_id: productId,
            variant: "Default",
            stock: parseInt(data.stock, 10)
          } as never);

        if (invError) {
          // Rollback product creation
          await supabase.from("products").delete().eq("id", productId);
          throw new Error("Failed to create inventory: " + invError.message);
        }
      }
    },
    onSuccess: () => {
      toast.success(productToEdit ? "Product updated" : "Product created");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["public-products"] });
      onOpenChange(false);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to save product");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.price || !form.mrp) {
      toast.error("Please fill in all required fields");
      return;
    }
    const p = parseFloat(form.price);
    const m = parseFloat(form.mrp);
    if (isNaN(p) || p < 0 || isNaN(m) || m < 0) {
      toast.error("Invalid price or MRP");
      return;
    }
    if (!productToEdit) {
      const s = parseInt(form.stock, 10);
      if (isNaN(s) || s < 0) {
        toast.error("Invalid initial stock");
        return;
      }
    }
    setBusy(true);
    saveMutation.mutate(form, {
      onSettled: () => setBusy(false)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{productToEdit ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {productToEdit ? "Make changes to your product here." : "Add a new product to your catalog."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input id="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug (Unique URL) *</Label>
              <Input id="slug" value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-')})} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Sale Price (₹) *</Label>
              <Input id="price" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mrp">Original MRP (₹) *</Label>
              <Input id="mrp" type="number" min="0" step="0.01" value={form.mrp} onChange={(e) => setForm({...form, mrp: e.target.value})} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} placeholder="e.g. Vases, Lighting" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Product Image</Label>
            <div className="flex gap-2">
              <Input 
                id="imageFile" 
                type="file" 
                accept="image/*" 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                    setForm({ ...form, image: "" }); // clear text URL if file chosen
                  }
                }} 
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Or provide an existing image URL or key:</p>
            <Input 
              id="imageUrl" 
              value={form.image} 
              disabled={!!imageFile}
              onChange={(e) => setForm({...form, image: e.target.value})} 
              placeholder="https://... or key (e.g. sofa1)" 
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} />
          </div>

          {!productToEdit && (
            <div className="space-y-2">
              <Label htmlFor="stock">Initial Stock Quantity *</Label>
              <Input id="stock" type="number" min="0" value={form.stock} onChange={(e) => setForm({...form, stock: e.target.value})} required />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? "Saving..." : "Save Product"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
