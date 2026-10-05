import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Modal, { Field, inputClass } from "../ui/Modal";
import { Button } from "../ui/Card";
import { useCreateOrder } from "../../hooks/useOrders";
import { useProducts } from "../../hooks/useProducts";
import { formatPrice } from "../../utils/format";

// Fields are exactly those in the Postman "Create Order" request. Inventory
// deduction happens server-side.
const emptyForm = { customerName: "", customerPhone: "", address: "", items: [{ productId: "", quantity: 1 }] };

const CreateOrderModal = ({ open, onClose, companyId }) => {
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const { mutate, pending, error, resetError } = useCreateOrder(companyId);
  const { products, isLoading: productsLoading } = useProducts(open ? companyId : null);
  const activeProducts = products.filter((p) => p.isActive);

  const close = () => {
    setForm(emptyForm);
    setErrors({});
    resetError();
    onClose();
  };

  const setItem = (index, patch) =>
    setForm((f) => ({ ...f, items: f.items.map((it, i) => (i === index ? { ...it, ...patch } : it)) }));

  const validate = () => {
    const e = {};
    if (!form.customerName.trim()) e.customerName = "Customer name is required.";
    if (!form.customerPhone.trim()) e.customerPhone = "Phone number is required.";
    if (!form.address.trim()) e.address = "Delivery address is required.";
    if (!form.items.length || form.items.some((it) => !it.productId || !(Number(it.quantity) > 0))) {
      e.items = "Pick a product and a quantity of at least 1 for every line.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const result = await mutate({
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.trim(),
      address: form.address.trim(),
      items: form.items.map((it) => ({ productId: it.productId, quantity: Number(it.quantity) })),
    });
    if (result.ok) close();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="New order"
      description="Create an order manually. Stock is deducted by RouteX when the order is saved."
      footer={
        <>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button variant="dark" type="submit" form="create-order-form" disabled={pending}>
            {pending ? "Creating…" : "Create order"}
          </Button>
        </>
      }
    >
      <form id="create-order-form" onSubmit={submit} className="space-y-4" noValidate>
        {error && <p role="alert" className="rounded-xl bg-alert-soft px-3 py-2 text-sm text-alert">{error}</p>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Customer name" error={errors.customerName}>
            <input className={inputClass} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
          </Field>
          <Field label="Customer phone" error={errors.customerPhone}>
            <input className={inputClass} dir="ltr" inputMode="tel" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
          </Field>
        </div>
        <Field label="Delivery address" error={errors.address}>
          <input className={inputClass} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </Field>

        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-[13px] font-medium text-black">Items</legend>
          {productsLoading ? (
            <div className="skeleton h-11 rounded-xl" aria-hidden="true" />
          ) : activeProducts.length === 0 ? (
            <p className="rounded-xl bg-canvas px-3 py-2.5 text-sm text-gray">Add an active product before creating orders.</p>
          ) : (
            form.items.map((item, i) => (
              <div key={i} className="flex gap-2">
                <select
                  aria-label={`Product for line ${i + 1}`}
                  className={`${inputClass} flex-1`}
                  value={item.productId}
                  onChange={(e) => setItem(i, { productId: e.target.value })}
                >
                  <option value="">Select a product</option>
                  {activeProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.price !== null ? ` · ${formatPrice(p.price)}` : ""}
                      {p.stockQuantity !== null ? ` · ${p.stockQuantity} in stock` : ""}
                    </option>
                  ))}
                </select>
                <input
                  aria-label={`Quantity for line ${i + 1}`}
                  type="number"
                  min="1"
                  className={`${inputClass} w-24`}
                  value={item.quantity}
                  onChange={(e) => setItem(i, { quantity: e.target.value })}
                />
                <button
                  type="button"
                  aria-label={`Remove line ${i + 1}`}
                  disabled={form.items.length === 1}
                  onClick={() => setForm((f) => ({ ...f, items: f.items.filter((_, j) => j !== i) }))}
                  className="grid w-11 place-items-center rounded-xl border border-line text-gray hover:text-alert disabled:opacity-30"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
          {errors.items && <p className="text-xs text-alert">{errors.items}</p>}
          {activeProducts.length > 0 && (
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, items: [...f.items, { productId: "", quantity: 1 }] }))}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-black hover:underline"
            >
              <Plus size={15} /> Add item
            </button>
          )}
        </fieldset>
      </form>
    </Modal>
  );
};

export default CreateOrderModal;
