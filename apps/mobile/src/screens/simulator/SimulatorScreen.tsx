import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { simulatorApi } from "../../api/simulator";
import { SimulatorConfig } from "../../types";

// Coordenadas geográficas da empresa: Rua João Gomes, Campos do Bolão, 3025-663 Coimbra
// Usadas como ponto de partida para calcular a distância até ao cliente
const COMPANY = { lat: 40.2350, lng: -8.3900 };

// Fórmula de Haversine — calcula a distância em linha reta entre dois pontos GPS (em km)
// O fator 1.4 é uma estimativa empírica para converter distância aérea em distância por estrada
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // raio médio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  // × 1.4 para estimar distância por estrada
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.4);
}

// Converte uma morada em texto para coordenadas GPS usando a API gratuita Nominatim (OpenStreetMap).
// Adiciona ", Portugal" para melhorar a precisão dos resultados.
async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ", Portugal")}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "User-Agent": "AgroWood/1.0" } });
  const data = await res.json();
  if (!data.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

export default function SimulatorScreen() {
  // Lista de configurações carregadas da base de dados (tipos de madeira, preços, unidades)
  const [configs, setConfigs] = useState<SimulatorConfig[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [quantity, setQuantity] = useState("1");
  const [includeTransport, setIncludeTransport] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [calculatedKm, setCalculatedKm] = useState<number | null>(null); // distância calculada pelo Haversine
  const [geocoding, setGeocoding] = useState(false); // loading enquanto chama o Nominatim
  const [result, setResult] = useState<any>(null); // orçamento devolvido pela API
  const [loading, setLoading] = useState(false);

  // Carrega os tipos de madeira disponíveis ao montar o ecrã
  useEffect(() => {
    simulatorApi.configs().then(({ data }) => {
      const configs = data ?? [];
      setConfigs(configs);
      if (configs.length > 0) setSelectedType(configs[0].wood_type); // seleciona o primeiro por defeito
    });
  }, []);

  // Geocodifica a morada introduzida pelo utilizador e calcula a distância até à empresa
  async function handleCalculateDistance() {
    if (!deliveryAddress.trim()) {
      Alert.alert("Erro", "Introduza uma morada de entrega");
      return;
    }
    setGeocoding(true);
    setCalculatedKm(null);
    try {
      const coords = await geocodeAddress(deliveryAddress);
      if (!coords) {
        Alert.alert("Morada não encontrada", "Não foi possível encontrar essa morada. Tente ser mais específico (ex: Rua X, Cidade).");
        return;
      }
      const km = haversine(COMPANY.lat, COMPANY.lng, coords.lat, coords.lng);
      setCalculatedKm(km);
    } catch {
      Alert.alert("Erro", "Não foi possível calcular a distância. Verifique a ligação à internet.");
    } finally {
      setGeocoding(false);
    }
  }

  // Envia os dados para a API do simulador e guarda o orçamento calculado
  async function calculate() {
    if (!selectedType || !quantity) return Alert.alert("Erro", "Preencha todos os campos");
    // É obrigatório calcular a distância antes de pedir o orçamento com transporte
    if (includeTransport && !calculatedKm) return Alert.alert("Erro", "Calcule a distância de entrega primeiro");
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
      Alert.alert("Erro", e?.message || "Erro no cálculo");
    } finally {
      setLoading(false);
    }
  }

  const selectedConfig = configs.find((c) => c.wood_type === selectedType);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <Text style={styles.title}>🧮 Simulador de Orçamento</Text>
      <Text style={styles.subtitle}>Calcule o preço da sua madeira</Text>

      {/* Seleção do tipo de madeira */}
      <View style={styles.section}>
        <Text style={styles.label}>Tipo de madeira</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
          {configs.map((c) => (
            <Pressable key={c.wood_type} style={[styles.typeChip, selectedType === c.wood_type && styles.typeChipActive]} onPress={() => setSelectedType(c.wood_type)}>
              <Text style={[styles.typeText, selectedType === c.wood_type && styles.typeTextActive]}>{c.wood_type}</Text>
            </Pressable>
          ))}
        </ScrollView>
        {selectedConfig && (
          <Text style={styles.hint}>€{Number(selectedConfig.price_per_unit).toFixed(2)} por {selectedConfig.unit}</Text>
        )}
      </View>

      {/* Campo de quantidade na unidade correspondente ao tipo selecionado */}
      <View style={styles.section}>
        <Text style={styles.label}>Quantidade ({selectedConfig?.unit ?? "unidade"})</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={quantity} onChangeText={setQuantity} placeholder="Ex: 10" />
      </View>

      {/* Opção de incluir transporte — mostra o campo de morada ao ativar */}
      <View style={styles.section}>
        <Pressable style={styles.toggleRow} onPress={() => { setIncludeTransport(!includeTransport); setCalculatedKm(null); setDeliveryAddress(""); }}>
          <View style={[styles.checkbox, includeTransport && styles.checkboxActive]}>
            {includeTransport && <Text style={{ color: "#fff", fontSize: 12 }}>✓</Text>}
          </View>
          <Text style={styles.toggleLabel}>Incluir transporte</Text>
        </Pressable>

        {includeTransport && (
          <View style={{ marginTop: 14, gap: 10 }}>
            <Text style={styles.label}>Morada de entrega</Text>
            <TextInput
              style={styles.input}
              value={deliveryAddress}
              onChangeText={(v) => { setDeliveryAddress(v); setCalculatedKm(null); }}
              placeholder="Ex: Rua das Flores 10, Porto"
              autoCapitalize="words"
            />
            {/* Botão que chama o Nominatim e aplica o Haversine */}
            <Pressable style={styles.distBtn} onPress={handleCalculateDistance} disabled={geocoding}>
              {geocoding
                ? <ActivityIndicator color="#2d6a4f" size="small" />
                : <Text style={styles.distBtnText}>📍 Calcular distância</Text>}
            </Pressable>
            {calculatedKm !== null && (
              <View style={styles.distResult}>
                <Text style={styles.distResultText}>📏 Distância estimada: <Text style={{ fontWeight: "700" }}>{calculatedKm} km</Text></Text>
                <Text style={styles.distResultSub}>A partir de Coimbra (valor aproximado por estrada)</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <Pressable style={styles.calcBtn} onPress={calculate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.calcBtnText}>Calcular Orçamento</Text>}
      </Pressable>

      {/* Tabela de resultados com custo da madeira, transporte e total */}
      {result && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>Orçamento</Text>
          <View style={styles.resultRow}><Text>Madeira</Text><Text>€{result.wood_cost.toFixed(2)}</Text></View>
          {result.transport_cost > 0 && (
            <View style={styles.resultRow}>
              <Text>Transporte ({calculatedKm} km)</Text>
              <Text>€{result.transport_cost.toFixed(2)}</Text>
            </View>
          )}
          <View style={[styles.resultRow, styles.resultTotal]}>
            <Text style={styles.resultTotalLabel}>Total estimado</Text>
            <Text style={styles.resultTotalValue}>€{result.total.toFixed(2)}</Text>
          </View>
          <Text style={styles.disclaimer}>* Preço estimado, sujeito a confirmação.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  title: { fontSize: 24, fontWeight: "700", color: "#2d6a4f" },
  subtitle: { color: "#888", marginTop: -10 },
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  label: { fontWeight: "600", color: "#333", marginBottom: 6 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#e8f5e9", marginRight: 8 },
  typeChipActive: { backgroundColor: "#2d6a4f" },
  typeText: { color: "#2d6a4f", fontWeight: "600" },
  typeTextActive: { color: "#fff" },
  hint: { color: "#888", fontSize: 13, marginTop: 6 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, fontSize: 15 },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#2d6a4f", alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: "#2d6a4f" },
  toggleLabel: { fontSize: 15, color: "#333" },
  distBtn: { borderWidth: 1.5, borderColor: "#2d6a4f", borderRadius: 10, padding: 12, alignItems: "center" },
  distBtnText: { color: "#2d6a4f", fontWeight: "600", fontSize: 14 },
  distResult: { backgroundColor: "#f0faf4", borderRadius: 10, padding: 12 },
  distResultText: { color: "#2d6a4f", fontSize: 14 },
  distResultSub: { color: "#888", fontSize: 12, marginTop: 4 },
  calcBtn: { backgroundColor: "#2d6a4f", borderRadius: 12, padding: 16, alignItems: "center" },
  calcBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  result: { backgroundColor: "#fff", borderRadius: 12, padding: 20 },
  resultTitle: { fontWeight: "700", fontSize: 17, color: "#333", marginBottom: 12 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  resultTotal: { borderTopWidth: 1, borderTopColor: "#eee", paddingTop: 12, marginTop: 6 },
  resultTotalLabel: { fontWeight: "700", fontSize: 17, color: "#333" },
  resultTotalValue: { fontWeight: "700", fontSize: 20, color: "#2d6a4f" },
  disclaimer: { color: "#aaa", fontSize: 12, marginTop: 10 },
});
