"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/dashboard/product-form";

type Initial = {
  id?: string; ean?: string; nome?: string; descricao?: string;
  precoCents?: number; quantidade?: number; imagePath?: string;
};

export function ProductFormDialog({ mode, initial, trigger }: {
  mode: "create" | "edit";
  initial?: Initial;
  trigger: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex w-full">
        {trigger}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-t-2xl bg-card p-6 shadow-xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">{mode === "create" ? "Novo produto" : "Editar produto"}</h2>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)} aria-label="Fechar">✕</Button>
            </div>
            <ProductForm key={initial?.id ?? "new"} mode={mode} initial={initial} />
          </div>
        </div>
      )}
    </>
  );
}

import { deleteProductAction } from "@/actions/products";

export function DeleteProductButton({ id, label }: { id: string; label?: string }) {
  return (
    <form action={deleteProductAction}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="sm" className="text-danger hover:bg-danger/10">
        {label ?? "Excluir"}
      </Button>
    </form>
  );
}