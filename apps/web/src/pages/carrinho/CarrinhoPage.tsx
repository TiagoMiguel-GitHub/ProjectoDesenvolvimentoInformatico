import { Link } from "react-router-dom";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { getProductEmoji } from "../../lib/productEmoji";

export default function CarrinhoPage() {
  const { items, total, updateItem, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-12 h-12 text-primary-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">O carrinho está vazio</h2>
        <p className="text-gray-400 mb-8">Adicione produtos da nossa loja para continuar.</p>
        <Link to="/loja" className="btn-primary">Ver produtos</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-10 flex items-center gap-3">
        <ShoppingCart className="w-9 h-9 text-primary-500" /> Carrinho
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="card p-6 flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl flex items-center justify-center text-4xl flex-shrink-0">
                {getProductEmoji(item.product.name, item.product.category?.slug)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 truncate">{item.product.name}</h3>
                <p className="text-primary-500 font-semibold text-sm mt-1">€{Number(item.product.price_per_unit).toFixed(2)}/{item.product.unit}</p>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-1">
                <button onClick={() => updateItem(item.product.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold">{item.quantity}</span>
                <button onClick={() => updateItem(item.product.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="text-right min-w-[80px]">
                <p className="font-bold text-gray-900">€{(Number(item.product.price_per_unit) * item.quantity).toFixed(2)}</p>
              </div>
              <button onClick={() => removeItem(item.product.id)} className="p-2 text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Resumo</h2>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm text-gray-500">
                  <span className="truncate mr-2">{item.product.name} ×{item.quantity}</span>
                  <span className="font-medium text-gray-700">€{(Number(item.product.price_per_unit) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-4 flex justify-between mb-8">
              <span className="font-bold text-gray-900 text-lg">Total</span>
              <span className="font-bold text-primary-500 text-2xl">€{total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="btn-primary w-full flex items-center justify-center gap-2 text-base">
              Finalizar compra <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/loja" className="block text-center text-sm text-gray-400 hover:text-primary-500 mt-4 transition-colors">
              Continuar a comprar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
