import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  deleteProduct,
  listProductsAdmin,
  upsertProduct,
  listCategoriesAdmin,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { formatTsh } from "@/lib/format";
import { ImageUploader } from "@/components/ImageUploader";

export const Route = createFileRoute("/_authenticated/admin/products")({
  component: ProductsAdmin,
});

type ProductRow = Awaited<ReturnType<typeof listProductsAdmin>>[number];

function blank() {
  return {
    id: undefined as string | undefined,
    name: "",
    slug: "",
    sku: "",
    category_slug: "",
    description: "",
    benefits: "",
    usage: "",
    retail_price: 0,
    wholesale_price: 0,
    moq: 1,
    image_url: "",
    gallery: [] as string[],
    in_stock: true,
    featured: false,
  };
}

function ProductsAdmin() {
  const lp = useServerFn(listProductsAdmin);
  const lc = useServerFn(listCategoriesAdmin);
  const up = useServerFn(upsertProduct);
  const del = useServerFn(deleteProduct);
  const qc = useQueryClient();

  const { data: products } = useQuery({ queryKey: ["admin-products"], queryFn: () => lp() });
  const { data: cats } = useQuery({ queryKey: ["admin-categories"], queryFn: () => lc() });
  const [editing, setEditing] = useState<ReturnType<typeof blank> | null>(null);

  const save = useMutation({
    mutationFn: (input: ReturnType<typeof blank>) => up({ data: input }),
    onSuccess: () => {
      toast.success("Saved");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
      setEditing(null);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  function startEdit(p: ProductRow) {
    setEditing({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku ?? "",
      category_slug: p.category_slug,
      description: p.description,
      benefits: p.benefits,
      usage: p.usage,
      retail_price: Number(p.retail_price),
      wholesale_price: Number(p.wholesale_price),
      moq: p.moq,
      image_url: p.image_url,
      gallery: p.gallery ?? [],
      in_stock: p.in_stock,
      featured: p.featured,
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-3xl">Products</h2>
        <Button onClick={() => setEditing(blank())}>
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </div>

      {editing && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate(editing);
          }}
          className="border border-border rounded-lg p-5 mb-6 bg-card space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Name">
              <Input
                required
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </Field>
            <Field label="Slug (lowercase, dashes)">
              <Input
                required
                pattern="[a-z0-9-]+"
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
              />
            </Field>
            <Field label="SKU">
              <Input
                value={editing.sku ?? ""}
                onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
              />
            </Field>
            <Field label="Category slug">
              <select
                required
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
                value={editing.category_slug}
                onChange={(e) => setEditing({ ...editing, category_slug: e.target.value })}
              >
                <option value="">Select…</option>
                {(cats ?? []).map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Retail price (TSh)">
              <Input
                type="number"
                min={0}
                required
                value={editing.retail_price}
                onChange={(e) => setEditing({ ...editing, retail_price: Number(e.target.value) })}
              />
            </Field>
            <Field label="Wholesale price (TSh)">
              <Input
                type="number"
                min={0}
                required
                value={editing.wholesale_price}
                onChange={(e) =>
                  setEditing({ ...editing, wholesale_price: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="MOQ">
              <Input
                type="number"
                min={1}
                required
                value={editing.moq}
                onChange={(e) => setEditing({ ...editing, moq: Number(e.target.value) })}
              />
            </Field>
          </div>
          {/* ── Image upload ── */}
          <Field label="Product Image">
            <ImageUploader
              value={editing.image_url}
              onChange={(url) => setEditing({ ...editing, image_url: url })}
            />
          </Field>
          <Field label="Description">
            <Textarea
              value={editing.description}
              onChange={(e) => setEditing({ ...editing, description: e.target.value })}
            />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Benefits">
              <Textarea
                value={editing.benefits}
                onChange={(e) => setEditing({ ...editing, benefits: e.target.value })}
              />
            </Field>
            <Field label="Usage">
              <Textarea
                value={editing.usage}
                onChange={(e) => setEditing({ ...editing, usage: e.target.value })}
              />
            </Field>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.in_stock}
                onChange={(e) => setEditing({ ...editing, in_stock: e.target.checked })}
              />{" "}
              In stock
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={editing.featured}
                onChange={(e) => setEditing({ ...editing, featured: e.target.checked })}
              />{" "}
              Featured
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <div className="border border-border rounded-lg divide-y divide-border bg-card">
        {(products ?? []).map((p) => (
          <div key={p.id} className="p-4 flex items-center gap-4">
            {p.image_url ? (
              <img
                src={p.image_url}
                alt={p.name}
                className="h-12 w-12 object-cover rounded-lg border border-border flex-shrink-0"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg border border-dashed border-border bg-muted flex items-center justify-center flex-shrink-0">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{p.name}</div>
              <div className="text-xs text-muted-foreground">
                {p.category_slug} • {formatTsh(Number(p.retail_price))} /{" "}
                {formatTsh(Number(p.wholesale_price))} (MOQ {p.moq})
              </div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => startEdit(p)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                if (confirm("Delete this product?")) remove.mutate(p.id);
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        {(products ?? []).length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No products yet.</div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider">{label}</Label>
      {children}
    </div>
  );
}
