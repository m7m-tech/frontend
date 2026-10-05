import React, { useEffect, useState } from "react";
import Modal, { Field, inputClass } from "../ui/Modal";
import { Button } from "../ui/Card";
import { useAdjustStock, useCreateProduct, useDeleteProduct, useUpdateProduct } from "../../hooks/useProducts";

const ErrorLine = ({ children }) =>
  children ? (
    <p role="alert" className="rounded-xl bg-alert-soft px-3 py-2 text-sm text-alert">
      {children}
    </p>
  ) : null;

// Create uses POST /products { name, price, sku, stockQuantity }.
// Edit uses PATCH /products/stock, which (per Postman) accepts name, sku and
// isActive only — price and stock aren't editable there, so they're not shown.
export const ProductFormModal = ({ open, product, companyId, onClose }) => {
  const isEdit = Boolean(product);
  const create = useCreateProduct(companyId);
  const update = useUpdateProduct(companyId);
  const mutation = isEdit ? update : create;
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setForm(
      product
        ? { name: product.name, sku: product.sku || "", isActive: product.isActive }
        : { name: "", sku: "", price: "", stockQuantity: "" }
    );
    setErrors({});
    create.resetError();
    update.resetError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product]);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name?.trim()) errs.name = "Name is required.";
    if (!form.sku?.trim()) errs.sku = "SKU is required.";
    if (!isEdit) {
      if (form.price === "" || Number(form.price) < 0) errs.price = "Enter a price of 0 or more.";
      if (form.stockQuantity === "" || !Number.isInteger(Number(form.stockQuantity)) || Number(form.stockQuantity) < 0)
        errs.stockQuantity = "Enter a whole number of 0 or more.";
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const result = isEdit
      ? await update.mutate({ productId: product.id, name: form.name.trim(), sku: form.sku.trim(), isActive: form.isActive })
      : await create.mutate({
          name: form.name.trim(),
          sku: form.sku.trim(),
          price: Number(form.price),
          stockQuantity: Number(form.stockQuantity),
        });
    if (result.ok) onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit product" : "New product"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="dark" type="submit" form="product-form" disabled={mutation.pending}>
            {mutation.pending ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={submit} className="space-y-4" noValidate>
        <ErrorLine>{mutation.error}</ErrorLine>
        <Field label="Product name" error={errors.name}>
          <input className={inputClass} value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="SKU" error={errors.sku}>
          <input className={inputClass} value={form.sku ?? ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        </Field>
        {!isEdit && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Price" error={errors.price}>
              <input type="number" min="0" step="0.01" className={inputClass} value={form.price ?? ""} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </Field>
            <Field label="Opening stock" error={errors.stockQuantity}>
              <input type="number" min="0" step="1" className={inputClass} value={form.stockQuantity ?? ""} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
            </Field>
          </div>
        )}
        {isEdit && (
          <label className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
            <span>
              <span className="block text-sm font-medium">Active</span>
              <span className="block text-xs text-gray">Inactive products can't be added to new orders.</span>
            </span>
            <input
              type="checkbox"
              className="h-5 w-5 accent-[#8FE600]"
              checked={Boolean(form.isActive)}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
          </label>
        )}
      </form>
    </Modal>
  );
};

// POST /products/adjust-stock { quantityDelta } — positive restocks, negative removes.
export const AdjustStockModal = ({ product, companyId, onClose }) => {
  const { mutate, pending, error, resetError } = useAdjustStock(companyId);
  const [mode, setMode] = useState("add");
  const [amount, setAmount] = useState("");
  const [fieldError, setFieldError] = useState(null);

  useEffect(() => {
    setMode("add");
    setAmount("");
    setFieldError(null);
    resetError();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const submit = async (e) => {
    e.preventDefault();
    const n = Number(amount);
    if (!Number.isInteger(n) || n <= 0) return setFieldError("Enter a whole number greater than 0.");
    const result = await mutate({ productId: product.id, quantityDelta: mode === "add" ? n : -n });
    if (result.ok) onClose();
  };

  return (
    <Modal
      open={Boolean(product)}
      onClose={onClose}
      title="Adjust stock"
      description={product ? `${product.name} · ${product.stockQuantity ?? "—"} in stock` : undefined}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="dark" type="submit" form="adjust-form" disabled={pending}>
            {pending ? "Saving…" : "Apply"}
          </Button>
        </>
      }
    >
      <form id="adjust-form" onSubmit={submit} className="space-y-4" noValidate>
        <ErrorLine>{error}</ErrorLine>
        <div role="radiogroup" aria-label="Adjustment type" className="grid grid-cols-2 gap-1 rounded-full border border-line p-1">
          {[
            ["add", "Add stock"],
            ["remove", "Remove stock"],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={mode === key}
              onClick={() => setMode(key)}
              className={`rounded-full py-2 text-sm ${mode === key ? "bg-brand font-medium" : "text-gray"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <Field label="Quantity" error={fieldError}>
          <input type="number" min="1" step="1" className={inputClass} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
      </form>
    </Modal>
  );
};

export const DeleteProductModal = ({ product, companyId, onClose }) => {
  const { mutate, pending, error, resetError } = useDeleteProduct(companyId);
  useEffect(() => resetError(), [product]); // eslint-disable-line react-hooks/exhaustive-deps

  const confirm = async () => {
    const result = await mutate({ productId: product.id });
    if (result.ok) onClose();
  };

  return (
    <Modal
      open={Boolean(product)}
      onClose={onClose}
      title="Delete product?"
      width="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={confirm} disabled={pending}>
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <ErrorLine>{error}</ErrorLine>
        <p className="text-sm text-gray">
          <span className="font-medium text-black">{product?.name}</span> will be removed permanently. This can't be undone.
        </p>
      </div>
    </Modal>
  );
};
