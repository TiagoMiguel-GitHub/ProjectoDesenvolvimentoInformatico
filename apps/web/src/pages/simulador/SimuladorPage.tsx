// Página do simulador de orçamento para o website.
// Permite calcular o custo estimado de madeira e transporte sem necessidade de login.
import { useEffect, useState } from "react";
import { Calculator, Truck, TreePine, MapPin, Loader2 } from "lucide-react";
import { simulatorApi } from "../../api/simulator";
import type { SimulatorConfig } from "../../types";

// Coordenadas geográficas da empresa: Rua João Gomes, Campos do Bolão, 3025-663 Coimbra
// Usadas como ponto de partida para calcular a distância até ao cliente
const COMPANY = { lat: 40.2350, lng: -8.3900 };

// Fórmula de Haversine — calcula a distância em linha reta entre dois pontos GPS.
// O fator × 1.4 é uma estimativa empírica para converter distância aérea em distância real por estrada.
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // raio médio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  // × 1.4 para estimar distância por estrada
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.4);
}

// Converte uma morada de texto em coordenadas GPS usando a API Nominatim (OpenStreetMap).
// Gratuita e sem necessidade de chave de API — adequada para volumes baixos de pedidos.
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ", Portugal")}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "User-Agent": "AgroWood/1.0" } });
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

export default function SimuladorPage() {
  const [configs, setConfigs] = useState<SimulatorConfig[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [includeTransport, setIncludeTransport] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [calculatedKm, setCalculatedKm] = useState<number | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const [result, setResult] = useState<{ wood_cost: number; transport_cost: number; total: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [calcError, setCalcError] = useState("");

  useEffect(() => {
    simulatorApi.configs().then(({ data }) => {
      setConfigs(data);
      if (data.length > 0) setSelectedType(data[0].wood_type);
    });
  }, []);

  async function handleCalculateDistance() {
    if (!deliveryAddress.trim()) { setGeocodeError("Introduza uma morada de entrega"); return; }
    setGeocoding(true);
    setGeocodeError("");
    setCalculatedKm(null);
    try {
      const coords = await geocodeAddress(deliveryAddress);
      if (!coords) { setGeocodeError("Morada não encontrada. Tente ser mais específico (ex: Rua X 10, Porto)."); return; }
      setCalculatedKm(haversine(COMPANY.lat, COMPANY.lng, coords.lat, coords.lng));
    } catch {
      setGeocodeError("Erro de ligação. Verifique a internet e tente novamente.");
    } finally {
      setGeocoding(false);
    }
  }

  async function calculate() {
    setCalcError("");
    if (!selectedType || !quantity) { setCalcError("Preencha todos os campos"); return; }
    if (includeTransport && !calculatedKm) { setCalcError("Calcule a distância de entrega primeiro"); return; }
    setLoading(true);
    try {
      const { data } = await simulatorApi.calculate({
        wood_type: selectedType,
        quantity: Number(quantity),
        distance_km: includeTransport ? calculatedKm! : 0,
        include_transport: includeTransport,
      });
      setResult(data);
    } catch (e: any) {
      setCalcError(e?.message || "Erro no cálculo");
    } finally {
      setLoading(false);
    }
  }

  const selectedConfig = configs.find((c) => c.wood_type === selectedType);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calculator className="w-8 h-8 text-primary-500" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Simulador de Orçamento</h1>
        <p className="text-gray-500 text-lg">Calcule o preço estimado da sua madeira</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="space-y-6">
          {/* Wood type */}
          <div className="card p-6">
            <label className="label">Tipo de madeira</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {configs.map((c) => (
                <button
                  key={c.wood_type}
                  onClick={() => setSelectedType(c.wood_type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${selectedType === c.wood_type ? "bg-primary-500 text-white border-primary-500" : "bg-white text-gray-600 border-gray-200 hover:border-primary-300"}`}
                >
                  <TreePine className="w-4 h-4" /> {c.wood_type}
                </button>
              ))}
            </div>
            {selectedConfig && (
              <p className="text-sm text-gray-400 mt-3">
                €{Number(selectedConfig.price_per_unit).toFixed(2)} por {selectedConfig.unit}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="card p-6">
            <label className="label">Quantidade ({selectedConfig?.unit ?? "unidade"})</label>
            <input type="number" className="input" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Ex: 10" min="1" />
          </div>

          {/* Transport */}
          <div className="card p-6">
            <button
              onClick={() => { setIncludeTransport(!includeTransport); setCalculatedKm(null); setDeliveryAddress(""); setGeocodeError(""); }}
              className="flex items-center gap-3 w-full"
            >
              <div className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${includeTransport ? "bg-primary-500" : "bg-gray-200"}`}>
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${includeTransport ? "translate-x-7" : "translate-x-1"}`} />
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Incluir transporte</span>
              </div>
            </button>

            {includeTransport && (
              <div className="mt-5 space-y-3">
                <label className="label">Morada de entrega</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input flex-1"
                    value={deliveryAddress}
                    onChange={(e) => { setDeliveryAddress(e.target.value); setCalculatedKm(null); setGeocodeError(""); }}
                    onKeyDown={(e) => e.key === "Enter" && handleCalculateDistance()}
                    placeholder="Ex: Rua das Flores 10, Porto"
                  />
                  <button
                    onClick={handleCalculateDistance}
                    disabled={geocoding}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-primary-500 text-primary-500 font-semibold text-sm hover:bg-primary-50 transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {geocoding ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    {geocoding ? "A calcular..." : "Calcular"}
                  </button>
                </div>

                {geocodeError && (
                  <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{geocodeError}</p>
                )}

                {calculatedKm !== null && (
                  <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
                    <p className="text-primary-700 font-semibold text-sm">
                      📏 Distância estimada: <span className="font-bold">{calculatedKm} km</span>
                    </p>
                    <p className="text-primary-500 text-xs mt-1">A partir de Coimbra (estimativa por estrada)</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {calcError && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl">{calcError}</p>}

          <button
            onClick={calculate}
            disabled={loading || !selectedType || !quantity}
            className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
          >
            <Calculator className="w-5 h-5" />
            {loading ? "A calcular..." : "Calcular orçamento"}
          </button>
        </div>

        {/* Result */}
        <div>
          {result ? (
            <div className="card p-8 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Orçamento estimado</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-gray-50">
                  <span className="text-gray-500">Madeira ({quantity} {selectedConfig?.unit})</span>
                  <span className="font-semibold text-gray-900">€{result.wood_cost.toFixed(2)}</span>
                </div>
                {result.transport_cost > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-gray-500">Transporte ({calculatedKm} km)</span>
                    <span className="font-semibold text-gray-900">€{result.transport_cost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-3">
                  <span className="text-lg font-bold text-gray-900">Total estimado</span>
                  <span className="text-3xl font-bold text-primary-500">€{result.total.toFixed(2)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 bg-gray-50 rounded-xl p-4">
                * Preço estimado, sujeito a confirmação. Contacte-nos para uma proposta final personalizada.
              </p>
            </div>
          ) : (
            <div className="card p-8 flex flex-col items-center justify-center text-center h-64 bg-gradient-to-br from-primary-50 to-primary-100">
              <Calculator className="w-12 h-12 text-primary-300 mb-4" />
              <p className="text-gray-400">Preencha os campos e clique em calcular para ver o orçamento estimado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
