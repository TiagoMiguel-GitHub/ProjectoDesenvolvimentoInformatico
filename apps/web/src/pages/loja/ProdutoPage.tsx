import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Package, Minus, Plus } from "lucide-react";
import { productsApi } from "../../api/products";
import { useCart } from "../../context/CartContext";
import { getProductEmoji } from "../../lib/productEmoji";
import type { Product } from "../../types";

export default function ProdutoPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) productsApi.get(id).then(({ data }) => {
      setProduct(data);
      setQuantity(data?.min_order_quantity || 1);
    });
  }, [id]);

  function handleAdd() {
    if (!product) return;
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (!product) return (
    <div className="max-w-7xl mx-auto px-4 py-20 flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-primary-500 mb-8 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Voltar à loja
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="card h-96 flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 text-9xl">
          {getProductEmoji(product.name, product.category?.slug)}
        </div>

        {/* Info */}
        <div>
          <span className="inline-block bg-primary-50 text-primary-600 text-sm font-semibold px-3 py-1 rounded-full mb-4">
            {product.category?.name}
          </span>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          {product.description && <p className="text-gray-500 text-lg leading-relaxed mb-8">{product.description}</p>}

          <div className="card p-6 mb-6">
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-primary-500">€{Number(product.price_per_unit).toFixed(2)}</span>
              <span className="text-gray-400">por {product.unit}</span>
            </div>

            {product.stock_quantity > 0 ? (
              <>
                <div className="flex items-center gap-4 mb-6">
                  <label className="label mb-0">Quantidade</label>
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                    <button onClick={() => setQuantity(Math.max(product.min_order_quantity || 1, quantity - 1))} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-gray-400 text-sm">{product.unit}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                  <span>Subtotal</span>
                  <span className="text-xl font-bold text-gray-900">€{(Number(product.price_per_unit) * quantity).toFixed(2)}</span>
                </div>

                <button onClick={handleAdd} className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg transition-all ${added ? "bg-green-500 text-white" : "btn-primary"}`}>
                  <ShoppingCart className="w-5 h-5" />
                  {added ? "Adicionado ao carrinho!" : "Adicionar ao carrinho"}
                </button>

                {added && (
                  <div className="mt-4 flex gap-3">
                    <Link to="/carrinho" className="flex-1 btn-outline text-center text-sm py-2">Ver carrinho</Link>
                    <Link to="/checkout" className="flex-1 btn-primary text-center text-sm py-2">Finalizar compra</Link>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-3 rounded-xl">
                <Package className="w-5 h-5" />
                <span className="font-medium">Produto sem stock de momento</span>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-400 space-y-1">
            {product.min_order_quantity > 1 && <p>• Quantidade mínima: {product.min_order_quantity} {product.unit}</p>}
            <p>• Stock disponível: {product.stock_quantity} {product.unit}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
