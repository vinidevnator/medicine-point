"use client";
import { useState } from "react";
import { X, Trash2, Plus, Pencil } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { ProductForm } from "@/components/dashboard/product-form";
import { deleteProductAction } from "@/actions/products";

type Initial = {
  id?: string; ean?: string; name?: string; description?: string;
  priceCents?: number; quantity?: number; imagePath?: string; category?: string;
};

export function ProductFormDialog({ mode, initial, label, variant, size, className }: {
  mode: "create" | "edit";
  initial?: Initial;
  label: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const Icon = mode === "create" ? Plus : Pencil;
  return (
    <>
      <Button type="button" variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        <Icon className={mode === "create" ? "size-4" : "size-3.5"} aria-hidden /> {label}
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-gray-900/50 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-t-xl bg-card p-6 shadow-modal sm:rounded-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-subtitle">{mode === "create" ? "Novo produto" : "Editar produto"}</h2>
              <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Fechar">
                <X className="size-5" aria-hidden />
              </Button>
            </div>
            <ProductForm key={initial?.id ?? "new"} mode={mode} initial={initial} onSuccess={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}

export function DeleteProductButton({ id, label }: { id: string; label?: string }) {
  return (
    <form action={deleteProductAction}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="sm" className="text-danger hover:bg-danger/10">
        <Trash2 className="size-3.5" aria-hidden /> {label ?? "Excluir"}
      </Button>
    </form>
  );
}
