import React, { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);
  const [form, setForm] = useState({ name: "", slug: "", category_id: "", unit: "kg", price_per_unit: "", stock_quantity: "", min_order_quantity: "1", description: "" });
  const [stockEdit, setStockEdit] = useState<{ id: string; value: string } | null>(null);
  const [saveError, setSaveError] = useState("");
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({ name: "", slug: "" });
  const [catError, setCatError] = useState("");
  function toSlug(text: string) {
    return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function load() {
    const [p, c] = await Promise.all([api.get("/products"), api.get("/products/categories")]);
    setProducts(p.data);
    setCategories(c.data);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() { setSaveError(""); setEditProduct(null); setForm({ name: "", slug: "", category_id: categories[0]?.id ?? "", unit: "kg", price_per_unit: "", stock_quantity: "0", min_order_quantity: "1", description: "" }); setShowForm(true); }
  function openEdit(p: any) { setSaveError(""); setEditProduct(p); setForm({ name: p.name, slug: p.slug, category_id: p.category.id, unit: p.unit, price_per_unit: String(p.price_per_unit), stock_quantity: String(p.stock_quantity), min_order_quantity: String(p.min_order_quantity), description: p.description ?? "" }); setShowForm(true); }

  function setField(key: string, value: string) {
    setForm((f) => {
      const updated = { ...f, [key]: value };
      if (key === "name" && !editProduct) updated.slug = toSlug(value);
      return updated;
    });
  }

  async function save() {
    setSaveError("");
    if (!form.name || !form.price_per_unit || !form.category_id) { setSaveError("Nome, preço e categoria são obrigatórios"); return; }
    const slug = form.slug || toSlug(form.name);
    const body = { ...form, slug, description: form.description || null, price_per_unit: Number(form.price_per_unit), stock_quantity: Number(form.stock_quantity), min_order_quantity: Number(form.min_order_quantity) };
    try {
      if (editProduct) await api.patch(`/products/${editProduct.id}`, body);
      else await api.post("/products", body);
      setShowForm(false);
      load();
    } catch (e: any) {
      setSaveError(e?.response?.data?.detail?.[0]?.msg || e?.response?.data?.detail || "Erro ao guardar produto");
    }
  }

  function setCatField(key: string, value: string) {
    setCatForm((f) => { const updated = { ...f, [key]: value }; if (key === "name") updated.slug = toSlug(value); return updated; });
  }

  async function saveCategory() {
    setCatError("");
    if (!catForm.name) { setCatError("Nome é obrigatório"); return; }
    try {
      await api.post("/products/categories", { name: catForm.name, slug: catForm.slug || toSlug(catForm.name) });
      setShowCatForm(false);
      setCatForm({ name: "", slug: "" });
      load();
    } catch (e: any) {
      setCatError(e?.response?.data?.detail || "Erro ao criar categoria");
    }
  }

  async function updateStock(id: string, qty: string) {
    await api.patch(`/products/${id}/stock`, { stock_quantity: Number(qty) });
    setStockEdit(null);
    load();
  }

  async function uploadImage(id: string, file: File) {
    const fd = new FormData();
    fd.append("file", file);
    await api.post(`/products/${id}/image`, fd);
    load();
  }

  if (loading) return <div style={{ padding: 32 }}>A carregar...</div>;

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>Produtos</h1>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button style={s.catBtn} onClick={() => { setCatError(""); setCatForm({ name: "", slug: "" }); setShowCatForm(true); }}>+ Nova categoria</button>
          <button style={s.addBtn} onClick={openCreate}>+ Novo produto</button>
        </div>
      </div>

      {categories.length > 0 && (
        <div style={s.catBar}>
          {categories.map((c) => <span key={c.id} style={s.catChip}>{c.name}</span>)}
        </div>
      )}

      <div className="table-scroll" style={s.tableWrap}>
        <div style={s.table}>
          <div style={s.thead}><span>Produto</span><span>Categoria</span><span>Preço</span><span>Stock</span><span>Estado</span><span>Ações</span></div>
          {products.map((p) => (
            <div key={p.id} style={s.trow}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {p.image_url
                  ? <img src={p.image_url} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                  : <div style={{ width: 40, height: 40, background: "#f0f0f0", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>📦</div>}
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "#888" }}>{p.unit}</div>
                </div>
              </div>
              <span style={{ whiteSpace: "nowrap" }}>{p.category.name}</span>
              <span style={{ whiteSpace: "nowrap" }}>€{Number(p.price_per_unit).toFixed(2)}</span>
              <div>
                {stockEdit?.id === p.id ? (
                  <div style={{ display: "flex", gap: 4 }}>
                    <input style={s.stockInput} type="number" value={stockEdit?.value} onChange={(e) => setStockEdit({ id: p.id, value: e.target.value })} />
                    <button style={s.saveBtn} onClick={() => updateStock(p.id, stockEdit?.value ?? "0")}>✓</button>
                    <button style={s.cancelBtnSm} onClick={() => setStockEdit(null)}>✕</button>
                  </div>
                ) : (
                  <span onClick={() => setStockEdit({ id: p.id, value: String(p.stock_quantity) })} style={{ cursor: "pointer", borderBottom: "1px dashed #ccc", whiteSpace: "nowrap" }}>{p.stock_quantity} {p.unit}</span>
                )}
              </div>
              <span style={{ color: p.is_active ? "#22c55e" : "#ef4444", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap" }}>{p.is_active ? "Ativo" : "Inativo"}</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button style={s.editBtn} onClick={() => openEdit(p)}>Editar</button>
                <label style={s.imgBtn}>
                  📷
                  <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files && uploadImage(p.id, e.target.files[0])} />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCatForm && (
        <div style={s.overlay}>
          <div className="modal-box-sm" style={s.modal}>
            <h2 style={{ marginBottom: 20, color: "#2d6a4f" }}>Nova categoria</h2>
            <input style={s.input} placeholder="Nome (ex: Fruta, Madeira) *" value={catForm.name} onChange={(e) => setCatField("name", e.target.value)} />
            <input style={s.input} placeholder="Slug (gerado automaticamente)" value={catForm.slug} onChange={(e) => setCatField("slug", e.target.value)} />
            {catError && <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{catError}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button style={s.addBtn} onClick={saveCategory}>Criar</button>
              <button style={s.cancelBtn} onClick={() => setShowCatForm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div style={s.overlay}>
          <div className="modal-box" style={s.modal}>
            <h2 style={{ marginBottom: 20, color: "#2d6a4f" }}>{editProduct ? "Editar produto" : "Novo produto"}</h2>
            <input style={s.input} placeholder="Nome *" value={form.name} onChange={(e) => setField("name", e.target.value)} />
            <input style={s.input} placeholder="Slug (gerado automaticamente)" value={form.slug} onChange={(e) => setField("slug", e.target.value)} />
            <input style={s.input} placeholder="Descrição" value={form.description} onChange={(e) => setField("description", e.target.value)} />
            <select style={s.input} value={form.category_id} onChange={(e) => setField("category_id", e.target.value)}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select style={s.input} value={form.unit} onChange={(e) => setField("unit", e.target.value)}>
              {["kg", "unidade", "m3", "m2", "litro"].map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
            <input style={s.input} type="number" placeholder="Preço por unidade (€) *" value={form.price_per_unit} onChange={(e) => setField("price_per_unit", e.target.value)} />
            <input style={s.input} type="number" placeholder="Stock disponível" value={form.stock_quantity} onChange={(e) => setField("stock_quantity", e.target.value)} />
            <input style={s.input} type="number" placeholder="Quantidade mínima de encomenda" value={form.min_order_quantity} onChange={(e) => setField("min_order_quantity", e.target.value)} />
            {saveError && <p style={{ color: "#ef4444", fontSize: 13, margin: 0 }}>{saveError}</p>}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button style={s.addBtn} onClick={save}>Guardar</button>
              <button style={s.cancelBtn} onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  title: { color: "#2d6a4f", margin: 0 },
  addBtn: { background: "#2d6a4f", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  catBtn: { background: "#fff", color: "#2d6a4f", border: "1px solid #2d6a4f", padding: "10px 20px", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 14 },
  catBar: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 },
  catChip: { background: "#e8f5e9", color: "#2d6a4f", padding: "4px 12px", borderRadius: 20, fontSize: 13, fontWeight: 600 },
  tableWrap: { borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" },
  table: { background: "#fff", borderRadius: 12, overflow: "hidden", minWidth: 640 },
  thead: { display: "grid", gridTemplateColumns: "2fr 1fr 100px 140px 100px 120px", gap: 12, padding: "12px 16px", background: "#f8f8f8", fontWeight: 600, color: "#555", fontSize: 13 },
  trow: { display: "grid", gridTemplateColumns: "2fr 1fr 100px 140px 100px 120px", gap: 12, padding: "12px 16px", borderTop: "1px solid #f0f0f0", fontSize: 14, alignItems: "center" },
  stockInput: { width: 70, border: "1px solid #ccc", borderRadius: 6, padding: "4px 8px" },
  saveBtn: { background: "#22c55e", color: "#fff", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer" },
  cancelBtnSm: { background: "#ef4444", color: "#fff", border: "none", borderRadius: 6, padding: "6px 10px", cursor: "pointer" },
  cancelBtn: { background: "#f3f4f6", border: "none", padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontWeight: 700 },
  editBtn: { background: "#3b82f6", color: "#fff", border: "none", padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 13 },
  imgBtn: { background: "#f3f4f6", border: "none", padding: "6px 10px", borderRadius: 6, cursor: "pointer", fontSize: 16 },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 },
  modal: { background: "#fff", borderRadius: 16, padding: 28, display: "flex", flexDirection: "column", gap: 10 },
  input: { padding: "10px 14px", border: "1px solid #ccc", borderRadius: 8, fontSize: 14 },
};
