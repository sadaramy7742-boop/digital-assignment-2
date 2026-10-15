import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Search, ShoppingBag, X, Plus, Minus, Trash2, Pencil, AlertTriangle, Package,
  Boxes, Receipt, Laptop, Smartphone, Headphones, Watch, Camera, Keyboard, Store, LayoutDashboard, RotateCcw,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TechStore — Digital Litecracy Assignment 2" },
      { name: "description", content: "Digital Litecracy Assignment 2: TechStore, a student demonstration of an electronics e-commerce store with cart, simulated checkout and inventory management." },
      { property: "og:title", content: "TechStore — Digital Litecracy Assignment 2" },
      { property: "og:description", content: "Student project: e-commerce storefront with a working inventory management panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: App,
});

type Category = "Laptops" | "Phones" | "Audio" | "Wearables" | "Cameras" | "Accessories";
const CATEGORIES: Category[] = ["Laptops", "Phones", "Audio", "Wearables", "Cameras", "Accessories"];
const ICONS = { Laptops: Laptop, Phones: Smartphone, Audio: Headphones, Wearables: Watch, Cameras: Camera, Accessories: Keyboard };
type Product = { id: string; name: string; category: Category; price: number; stock: number; description: string };
type Order = { id: string; items: { name: string; qty: number; price: number }[]; total: number; date: string };
const LOW = 5;

const SEED: Product[] = [
  { id: "p1", name: "Aero 14 Ultrabook", category: "Laptops", price: 74999, stock: 8, description: "14-inch, 16GB RAM, 512GB SSD." },
  { id: "p2", name: "Forge 16 Pro", category: "Laptops", price: 129999, stock: 3, description: "Creator laptop with RTX graphics." },
  { id: "p3", name: "Pixelon 9", category: "Phones", price: 39999, stock: 14, description: "6.4\" OLED, 50MP camera." },
  { id: "p4", name: "Nova Lite 5G", category: "Phones", price: 17499, stock: 2, description: "Everyday 5G phone, 5000mAh." },
  { id: "p5", name: "Quiet ANC Headphones", category: "Audio", price: 12999, stock: 11, description: "Over-ear, 40h battery." },
  { id: "p6", name: "Pulse Earbuds", category: "Audio", price: 3499, stock: 25, description: "True wireless, IPX4." },
  { id: "p7", name: "Orbit Smartwatch", category: "Wearables", price: 8999, stock: 4, description: "AMOLED, heart-rate & GPS." },
  { id: "p8", name: "Lumen Mirrorless Z", category: "Cameras", price: 64999, stock: 6, description: "24MP APS-C, 4K video." },
  { id: "p9", name: "Tactile Mech Keyboard", category: "Accessories", price: 5499, stock: 18, description: "Hot-swap, 75% layout." },
  { id: "p10", name: "Glide Wireless Mouse", category: "Accessories", price: 1999, stock: 0, description: "Silent clicks, USB-C." },
];

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
const uid = () => Math.random().toString(36).slice(2, 9);

function useStored<T>(key: string, init: T) {
  const [v, setV] = useState<T>(init);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try { const s = localStorage.getItem(key); if (s) setV(JSON.parse(s)); } catch { /* ignore */ }
    setReady(true);
  }, [key]);
  useEffect(() => { if (ready) localStorage.setItem(key, JSON.stringify(v)); }, [key, v, ready]);
  return [v, setV] as const;
}

const btn = "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40 disabled:cursor-not-allowed";
const btnPrimary = `${btn} bg-primary text-primary-foreground hover:bg-primary/90`;
const btnGhost = `${btn} border border-border bg-card hover:bg-secondary`;
const input = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function App() {
  const [products, setProducts] = useStored<Product[]>("ts.products", SEED);
  const [orders, setOrders] = useStored<Order[]>("ts.orders", []);
  const [cart, setCart] = useStored<Record<string, number>>("ts.cart", {});
  const [view, setView] = useState<"shop" | "admin">("shop");
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const notify = (m: string) => { setToast(m); setTimeout(() => setToast(null), 2500); };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const addToCart = (p: Product) => {
    const cur = cart[p.id] ?? 0;
    if (cur >= p.stock) return notify("No more stock available for " + p.name);
    setCart({ ...cart, [p.id]: cur + 1 });
    notify(`Added ${p.name} to cart`);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <a href="#top" className="flex items-center gap-2 font-display text-xl font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Store className="h-4 w-4" /></span>
            TechStore
          </a>
          <nav className="flex items-center gap-1 rounded-lg bg-secondary p-1" aria-label="Main">
            {(["shop", "admin"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)} aria-pressed={view === v}
                className={`${btn} px-3 py-1.5 ${view === v ? "bg-card shadow-card" : "text-muted-foreground"}`}>
                {v === "shop" ? <><ShoppingBag className="h-4 w-4" /> Shop</> : <><LayoutDashboard className="h-4 w-4" /> Inventory</>}
              </button>
            ))}
          </nav>
          <button onClick={() => setCartOpen(true)} className={`${btnGhost} relative`} aria-label={`Open cart, ${cartCount} items`}>
            <ShoppingBag className="h-4 w-4" /><span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-xs text-accent-foreground">{cartCount}</span>}
          </button>
        </div>
        <div className="bg-primary py-1.5 text-center text-xs text-primary-foreground/80">
          Student demo — sample products, no real payments or orders.
        </div>
      </header>

      <main id="top" className="mx-auto max-w-6xl px-4 py-10">
        {view === "shop" ? <Shop products={products} onAdd={addToCart} cart={cart} /> :
          <Admin products={products} setProducts={setProducts} orders={orders} notify={notify}
            onReset={() => { setProducts(SEED); setOrders([]); setCart({}); notify("Demo data restored"); }} />}
        <About />
      </main>

      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        TechStore · <span className="font-semibold text-foreground">Digital Litecracy Assignment 2</span> · All products and prices are fictional demo data.
      </footer>

      {cartOpen && <CartDrawer products={products} cart={cart} setCart={setCart} onClose={() => setCartOpen(false)}
        onCheckout={(order) => {
          setProducts(products.map((p) => cart[p.id] ? { ...p, stock: p.stock - (cart[p.id] ?? 0) } : p));
          setOrders([order, ...orders]); setCart({});
        }} />}

      {toast && <div role="status" className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground shadow-card">{toast}</div>}
    </div>
  );
}

function Shop({ products, onAdd, cart }: { products: Product[]; onAdd: (p: Product) => void; cart: Record<string, number> }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<Category | "All">("All");
  const list = products.filter((p) => (cat === "All" || p.category === cat) && (p.name + p.description).toLowerCase().includes(q.toLowerCase()));
  return (
    <section>
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Electronics, simplified</p>
        <h1 className="mt-2 font-display text-4xl font-semibold leading-tight sm:text-5xl">Good tech, honestly priced.</h1>
        <p className="mt-3 text-muted-foreground">Browse laptops, phones, audio and more. Add to your cart and try the simulated checkout.</p>
      </div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search products</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input className={`${input} pl-9`} placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${cat === c ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:bg-secondary"}`}>{c}</button>
          ))}
        </div>
      </div>
      {list.length === 0 ? (
        <Empty icon={Search} title="No products found" text="Try a different search term or category." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => {
            const Icon = ICONS[p.category];
            const left = p.stock - (cart[p.id] ?? 0);
            return (
              <article key={p.id} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card">
                <div className="relative grid aspect-[4/3] place-items-center bg-secondary">
                  <Icon className="h-16 w-16 text-primary/70 transition-transform group-hover:scale-110" strokeWidth={1.25} aria-hidden />
                  <span className="absolute left-3 top-3 rounded-full bg-card px-2.5 py-1 text-xs font-medium">{p.category}</span>
                  {p.stock === 0 ? <span className="absolute right-3 top-3 rounded-full bg-destructive px-2.5 py-1 text-xs text-destructive-foreground">Sold out</span>
                    : p.stock < LOW && <span className="absolute right-3 top-3 rounded-full bg-warning px-2.5 py-1 text-xs text-primary">Only {p.stock} left</span>}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{p.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-bold">{inr(p.price)}</span>
                    <button className={btnPrimary} disabled={left <= 0} onClick={() => onAdd(p)}>
                      <Plus className="h-4 w-4" />{p.stock === 0 ? "Unavailable" : "Add"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function CartDrawer({ products, cart, setCart, onClose, onCheckout }: {
  products: Product[]; cart: Record<string, number>; setCart: (c: Record<string, number>) => void; onClose: () => void; onCheckout: (o: Order) => void;
}) {
  const [done, setDone] = useState<Order | null>(null);
  const [step, setStep] = useState<"cart" | "form">("cart");
  const [form, setForm] = useState({ name: "", email: "", address: "" });
  const [err, setErr] = useState<Partial<Record<"name" | "email" | "address", string>>>({});
  const items = products.filter((p) => cart[p.id]).map((p) => ({ p, qty: cart[p.id] ?? 0 }));
  const total = items.reduce((s, i) => s + i.p.price * i.qty, 0);
  useEffect(() => { const k = (e: KeyboardEvent) => e.key === "Escape" && onClose(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onClose]);

  const setQty = (id: string, q: number) => { const n = { ...cart }; if (q <= 0) delete n[id]; else n[id] = q; setCart(n); };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const er: Partial<Record<"name" | "email" | "address", string>> = {};
    if (form.name.trim().length < 2) er.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) er.email = "Enter a valid email.";
    if (form.address.trim().length < 8) er.address = "Enter a full address.";
    setErr(er);
    if (Object.keys(er).length) return;
    const o: Order = { id: "DEMO-" + uid().toUpperCase(), items: items.map((i) => ({ name: i.p.name, qty: i.qty, price: i.p.price })), total, date: new Date().toISOString() };
    onCheckout(o); setDone(o);
  };

  return (
    <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 bg-primary/40" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-background shadow-card">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-2xl font-semibold">{done ? "Order placed" : step === "form" ? "Checkout" : "Your cart"}</h2>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-secondary" aria-label="Close cart"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {done ? (
            <div className="text-center">
              <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success"><Receipt /></div>
              <p className="font-semibold">Thanks, {form.name}!</p>
              <p className="mt-1 text-sm text-muted-foreground">Simulated order <b>{done.id}</b> for {inr(done.total)}. No payment was taken — this is a demo.</p>
            </div>
          ) : items.length === 0 ? (
            <Empty icon={ShoppingBag} title="Your cart is empty" text="Add a product from the shop to get started." />
          ) : step === "cart" ? (
            <ul className="space-y-4">
              {items.map(({ p, qty }) => (
                <li key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-secondary">{(() => { const I = ICONS[p.category]; return <I className="h-6 w-6 text-primary/70" />; })()}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{inr(p.price)} each</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="rounded-md border border-border p-1 hover:bg-secondary" onClick={() => setQty(p.id, qty - 1)} aria-label={`Decrease ${p.name}`}><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center text-sm" aria-live="polite">{qty}</span>
                    <button className="rounded-md border border-border p-1 hover:bg-secondary disabled:opacity-40" disabled={qty >= p.stock} onClick={() => setQty(p.id, qty + 1)} aria-label={`Increase ${p.name}`}><Plus className="h-3 w-3" /></button>
                  </div>
                  <button className="rounded-md p-1 text-muted-foreground hover:text-destructive" onClick={() => setQty(p.id, 0)} aria-label={`Remove ${p.name}`}><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          ) : (
            <form id="checkout" onSubmit={submit} className="space-y-4" noValidate>
              {(["name", "email", "address"] as const).map((f) => (
                <div key={f}>
                  <label htmlFor={f} className="mb-1 block text-sm font-medium capitalize">{f}</label>
                  {f === "address" ? <textarea id={f} rows={3} className={input} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />
                    : <input id={f} type={f === "email" ? "email" : "text"} className={input} value={form[f]} onChange={(e) => setForm({ ...form, [f]: e.target.value })} />}
                  {err[f] && <p className="mt-1 text-xs text-destructive">{err[f]}</p>}
                </div>
              ))}
              <p className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">Simulated checkout: no card details are collected and no real payment occurs.</p>
            </form>
          )}
        </div>
        {!done && items.length > 0 && (
          <div className="border-t border-border p-5">
            <div className="mb-4 flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="text-lg font-bold">{inr(total)}</span></div>
            {step === "cart" ? <button className={`${btnPrimary} w-full`} onClick={() => setStep("form")}>Proceed to checkout</button>
              : <div className="flex gap-2"><button className={btnGhost} onClick={() => setStep("cart")}>Back</button><button form="checkout" type="submit" className={`${btnPrimary} flex-1`}>Place demo order</button></div>}
          </div>
        )}
      </aside>
    </div>
  );
}

const empty: Omit<Product, "id"> = { name: "", category: "Laptops", price: 0, stock: 0, description: "" };

function Admin({ products, setProducts, orders, notify, onReset }: {
  products: Product[]; setProducts: (p: Product[]) => void; orders: Order[]; notify: (m: string) => void; onReset: () => void;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  type F = { name: string; category: string; price: string; stock: string; description: string };
  const blank: F = { ...empty, price: "", stock: "" };
  const [form, setForm] = useState<F>(blank);
  type E = Partial<Record<"name" | "price" | "stock", string>>;
  const [err, setErr] = useState<E>({});
  const [confirm, setConfirm] = useState<Product | null>(null);
  const metrics = useMemo(() => ({
    products: products.length,
    units: products.reduce((s, p) => s + p.stock, 0),
    low: products.filter((p) => p.stock < LOW).length,
    orders: orders.length,
  }), [products, orders]);
  const lowItems = products.filter((p) => p.stock < LOW);

  const reset = () => { setEditing(null); setForm(blank); setErr({}); };
  const save = (e: FormEvent) => {
    e.preventDefault();
    const price = Number(form.price), stock = Number(form.stock), name = String(form.name).trim();
    const er: E = {};
    if (name.length < 2) er.name = "Name must be at least 2 characters.";
    else if (products.some((p) => p.name.toLowerCase() === name.toLowerCase() && p.id !== editing)) er.name = "A product with this name exists.";
    if (!(price > 0)) er.price = "Price must be greater than 0.";
    if (!Number.isInteger(stock) || stock < 0 || form.stock === "") er.stock = "Stock must be a whole number ≥ 0.";
    setErr(er);
    if (Object.keys(er).length) return;
    const data = { name, category: form.category as Category, price, stock, description: String(form.description).trim() || "No description." };
    if (editing) { setProducts(products.map((p) => p.id === editing ? { ...p, ...data } : p)); notify("Product updated"); }
    else { setProducts([{ id: uid(), ...data }, ...products]); notify("Product added"); }
    reset();
  };
  const changeStock = (id: string, d: number) => setProducts(products.map((p) => p.id === id ? { ...p, stock: Math.max(0, p.stock + d) } : p));

  return (
    <section>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">Admin</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Inventory</h1>
        </div>
        <button className={btnGhost} onClick={() => window.confirm("Restore sample products and clear demo orders?") && onReset()}><RotateCcw className="h-4 w-4" /> Reset demo data</button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { l: "Products", v: metrics.products, I: Package },
          { l: "Total units", v: metrics.units, I: Boxes },
          { l: "Low stock (<5)", v: metrics.low, I: AlertTriangle, warn: metrics.low > 0 },
          { l: "Demo orders", v: metrics.orders, I: Receipt },
        ].map(({ l, v, I, warn }) => (
          <div key={l} className="rounded-xl border border-border bg-card p-5 shadow-card">
            <I className={`h-5 w-5 ${warn ? "text-warning" : "text-accent"}`} />
            <p className="mt-3 text-3xl font-bold">{v}</p>
            <p className="text-sm text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>

      {lowItems.length > 0 && (
        <div role="alert" className="mb-8 flex gap-3 rounded-xl border border-warning/50 bg-warning/10 p-4 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
          <p><b>Low stock:</b> {lowItems.map((p) => `${p.name} (${p.stock})`).join(", ")}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <form onSubmit={save} noValidate className="h-fit space-y-3 rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="font-semibold">{editing ? "Edit product" : "Add product"}</h2>
          <Field label="Name" error={err.name}><input id="f-name" className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Category"><select id="f-category" className={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (₹)" error={err.price}><input id="f-price" type="number" min="0" className={input} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></Field>
            <Field label="Stock" error={err.stock}><input id="f-stock" type="number" min="0" step="1" className={input} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></Field>
          </div>
          <Field label="Description"><textarea id="f-description" rows={2} className={input} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></Field>
          <div className="flex gap-2 pt-1">
            <button type="submit" className={`${btnPrimary} flex-1`}>{editing ? "Save changes" : "Add product"}</button>
            {editing && <button type="button" className={btnGhost} onClick={reset}>Cancel</button>}
          </div>
        </form>

        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-card">
          {products.length === 0 ? <Empty icon={Package} title="No products yet" text="Add your first product using the form." /> : (
            <table className="w-full text-sm">
              <thead className="bg-secondary text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr><th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3 text-right">Actions</th></tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className={`border-t border-border ${p.stock < LOW ? "bg-warning/5" : ""}`}>
                    <td className="p-3"><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.category}</p></td>
                    <td className="p-3 whitespace-nowrap">{inr(p.price)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button className="rounded-md border border-border p-1 hover:bg-secondary disabled:opacity-40" disabled={p.stock === 0} onClick={() => changeStock(p.id, -1)} aria-label={`Decrease stock of ${p.name}`}><Minus className="h-3 w-3" /></button>
                        <span className={`w-8 text-center font-semibold ${p.stock < LOW ? "text-destructive" : ""}`}>{p.stock}</span>
                        <button className="rounded-md border border-border p-1 hover:bg-secondary" onClick={() => changeStock(p.id, 1)} aria-label={`Increase stock of ${p.name}`}><Plus className="h-3 w-3" /></button>
                        {p.stock < LOW && <AlertTriangle className="ml-1 h-4 w-4 text-warning" aria-label="Low stock" />}
                      </div>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <button className="rounded-md p-2 hover:bg-secondary" aria-label={`Edit ${p.name}`} onClick={() => { setEditing(p.id); setErr({}); setForm({ name: p.name, category: p.category, description: p.description, price: String(p.price), stock: String(p.stock) }); }}><Pencil className="h-4 w-4" /></button>
                      <button className="rounded-md p-2 text-destructive hover:bg-destructive/10" aria-label={`Delete ${p.name}`} onClick={() => setConfirm(p)}><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {orders.length > 0 && (
        <div className="mt-8 rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="mb-3 font-semibold">Recent demo orders</h2>
          <ul className="divide-y divide-border text-sm">
            {orders.slice(0, 5).map((o) => (
              <li key={o.id} className="flex justify-between py-2"><span>{o.id} · {o.items.reduce((s, i) => s + i.qty, 0)} items</span><span className="font-semibold">{inr(o.total)}</span></li>
            ))}
          </ul>
        </div>
      )}

      {confirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-primary/40 p-4" role="alertdialog" aria-modal="true" aria-labelledby="del-title">
          <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-card">
            <h3 id="del-title" className="font-semibold">Delete "{confirm.name}"?</h3>
            <p className="mt-2 text-sm text-muted-foreground">This removes the product from the store. This can't be undone.</p>
            <div className="mt-5 flex justify-end gap-2">
              <button className={btnGhost} onClick={() => setConfirm(null)} autoFocus>Cancel</button>
              <button className={`${btn} bg-destructive text-destructive-foreground hover:bg-destructive/90`} onClick={() => { setProducts(products.filter((p) => p.id !== confirm.id)); if (editing === confirm.id) reset(); setConfirm(null); notify("Product deleted"); }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Field({ label, error, children }: { label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={`f-${(label.split(" ")[0] ?? "").toLowerCase()}`} className="mb-1 block text-sm font-medium">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Empty({ icon: I, title, text }: { icon: typeof Search; title: string; text: string }) {
  return (
    <div className="grid place-items-center px-6 py-14 text-center">
      <I className="h-10 w-10 text-muted-foreground" strokeWidth={1.25} />
      <p className="mt-3 font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

function About() {
  return (
    <section id="about" className="mt-20 rounded-2xl bg-primary p-8 text-primary-foreground sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">Assignment</p>
      <h2 className="mt-1 font-display text-3xl font-semibold">Digital Litecracy Assignment 2</h2>
      <p className="mt-3 max-w-2xl text-primary-foreground/80">
        <b className="font-semibold text-primary-foreground">Digital Litecracy Assignment 2</b> — TechStore is a student demonstration of
        e-commerce and inventory management, built for a first-year B.Tech CSE
        digital literacy course. All products, prices and orders are sample data stored only in your browser.
        No real payments are processed and no real sales have taken place.
      </p>
    </section>
  );
}
