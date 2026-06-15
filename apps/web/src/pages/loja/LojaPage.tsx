// Página da loja — grelha de produtos com filtro por categoria e pesquisa por nome.
// Carrega produtos e categorias em paralelo ao montar o componente.
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Package, Search } from "lucide-react";
import { productsApi } from "../../api/products";
import { useCart } from "../../context/CartContext";
import { getProductEmoji } from "../../lib/productEmoji";
import type { Product, Category } from "../../types";

export default function LojaPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // null = mostrar todos
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  // `added` guarda o ID do produto recentemente adicionado para mostrar feedback visual (1.5s)
  const [added, setAdded] = useState<string | null>(null);

  // Carrega produtos e categorias em simultâneo para minimizar o tempo de espera
  useEffect(() => {
    Promise.all([productsApi.list(), productsApi.categories()]).then(([p, c]) => {
      setProducts(p.data);
      setCategories(c.data);
      setLoading(false);
    });
  }, []);

  // Filtragem no cliente: combina categoria selecionada e texto de pesquisa
  const filtered = products.filter((p) => {
    const matchCat = !selectedCategory || p.category?.id === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Adiciona ao carrinho com a quantidade mínima de encomenda definida para o produto
  function handleAdd(product: Product) {
    addItem(product, product.min_order_quantity || 1);
    setAdded(product.id);
    setTimeout(() => setAdded(null), 1500); // repõe o estado do botão após 1.5 segundos
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Loja</h1>
        <p className="text-gray-500 text-lg">Escolha os melhores produtos florestais</p>
      </div>

      {/* Barra de filtros: pesquisa por texto e botões de categoria */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            className="input pl-10"
            placeholder="Pesquisar produtos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {/* Botão "Todos" limpa o filtro de categoria */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${!selectedCategory ? "bg-primary-500 text-white border-primary-500" : "bg-white text-gray-600 border-gray-200 hover:border-primary-300"}`}
          >
            Todos
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${selectedCategory === c.id ? "bg-primary-500 text-white border-primary-500" : "bg-white text-gray-600 border-gray-200 hover:border-primary-300"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grelha de produtos — skeleton durante o carregamento, empty state se não houver resultados */}
      {loading ? (
        // Skeleton com animação pulse enquanto os dados carregam
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card animate-pulse"><div className="h-48 bg-gray-100" /><div className="p-5"><div className="h-4 bg-gray-100 rounded mb-2 w-3/4" /><div className="h-4 bg-gray-100 rounded w-1/2" /></div></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div key={product.id} className="card group hover:shadow-md transition-all hover:-translate-y-0.5">
              {/* Imagem do produto substituída por um emoji correspondente ao tipo de madeira */}
              <Link to={`/produto/${product.id}`}>
                <div className="h-48 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-6xl">
                  {getProductEmoji(product.name, product.category?.slug)}
                </div>
              </Link>
              <div className="p-5">
                <span className="text-xs text-primary-500 font-semibold uppercase tracking-wide">{product.category?.name}</span>
                <Link to={`/produto/${product.id}`}>
                  <h3 className="font-bold text-gray-900 mt-1 mb-1 group-hover:text-primary-500 transition-colors">{product.name}</h3>
                </Link>
                {product.description && <p className="text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>}
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-2xl font-bold text-primary-500">€{Number(product.price_per_unit).toFixed(2)}</span>
                    <span className="text-gray-400 text-sm">/{product.unit}</span>
                  </div>
                  {/* Botão muda para verde e texto "Adicionado!" durante 1.5s após adicionar ao carrinho */}
                  <button
                    onClick={() => handleAdd(product)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${added === product.id ? "bg-green-500 text-white" : "bg-primary-500 hover:bg-primary-600 text-white"}`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {added === product.id ? "Adicionado!" : "Adicionar"}
                  </button>
                </div>
                {product.stock_quantity === 0 && (
                  <p className="text-red-400 text-xs mt-2 font-medium">Sem stock</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
