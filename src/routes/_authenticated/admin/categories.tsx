import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { deleteCategory, listCategoriesAdmin, upsertCategory } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Pencil, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/categories")({
  component: CategoriesAdmin,
});

function blank() {
  return { id: undefined as string | undefined, name: "", slug: "", parent: "" as string | null, sort_order: 0 };
}

function CategoriesAdmin() {
  const lc = useServerFn(listCategoriesAdmin);
  const up = useServerFn(upsertCategory);
  const del = useServerFn(deleteCategory);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["admin-categories"], queryFn: () => lc() });
  const [editing, setEditing] = useState<ReturnType<typeof blank> | null>(null);

  const save = useMutation({
    mutationFn: (input: ReturnType<typeof blank>) => up({ data: { ...input, parent: input.parent || null } }),
    onSuccess: () => { toast.success("Saved"); qc.invalidateQueries({ queryKey: ["admin-categories"] }); setEditing(null); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => { toast.success("Deleted"); qc.invalidateQueries({ queryKey: ["admin-categories"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-3xl">Categories</h2>
        <Button onClick={() => setEditing(blank())}><Plus className="h-4 w-4" /> Add category</Button>
      </div>

      {editing && (
        <form onSubmit={(e) => { e.preventDefault(); save.mutate(editing); }}
          className="border border-border rounded-lg p-5 mb-6 bg-card grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs uppercase">Name</Label>
            <Input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase">Slug</Label>
            <Input required pattern="[a-z0-9-]+" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase">Parent slug (optional)</Label>
            <Input value={editing.parent ?? ""} onChange={(e) => setEditing({ ...editing, parent: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs uppercase">Sort order</Label>
            <Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })} />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button>
            <Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="border border-border rounded-lg divide-y divide-border bg-card">
        {(data ?? []).map((c) => (
          <div key={c.id} className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground">/{c.slug} {c.parent && <>• parent: {c.parent}</>}</div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setEditing({ id: c.id, name: c.name, slug: c.slug, parent: c.parent, sort_order: c.sort_order })}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { if (confirm("Delete category?")) remove.mutate(c.id); }}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
        {(data ?? []).length === 0 && <div className="p-8 text-center text-sm text-muted-foreground">No categories yet.</div>}
      </div>
    </div>
  );
}
