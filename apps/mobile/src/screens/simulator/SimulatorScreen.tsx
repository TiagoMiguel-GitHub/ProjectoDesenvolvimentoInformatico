import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { simulatorApi } from "../../api/simulator";
import { SimulatorConfig } from "../../types";

export default function SimulatorScreen() {
  const [configs, setConfigs] = useState<SimulatorConfig[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [quantity, setQuantity] = useState("1");
  const [includeTransport, setIncludeTransport] = useState(false);
  const [distance, setDistance] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    simulatorApi.configs().then(({ data }) => {
      const configs = data ?? [];
      setConfigs(configs);
      if (configs.length > 0) setSelectedType(configs[0].wood_type);
    });
  }, []);

  async function calculate() {
    if (!selectedType || !quantity) return Alert.alert("Erro", "Preencha todos os campos");
    setLoading(true);
    try {
      const { data } = await simulatorApi.calculate({
        wood_type: selectedType,
        quantity: Number(quantity),
        distance_km: includeTransport ? Number(distance) : 0,
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

      <View style={styles.section}>
        <Text style={styles.label}>Quantidade ({selectedConfig?.unit ?? "unidade"})</Text>
        <TextInput style={styles.input} keyboardType="numeric" value={quantity} onChangeText={setQuantity} placeholder="Ex: 10" />
      </View>

      <View style={styles.section}>
        <Pressable style={styles.toggleRow} onPress={() => setIncludeTransport(!includeTransport)}>
          <View style={[styles.checkbox, includeTransport && styles.checkboxActive]}>
            {includeTransport && <Text style={{ color: "#fff", fontSize: 12 }}>✓</Text>}
          </View>
          <Text style={styles.toggleLabel}>Incluir transporte</Text>
        </Pressable>
        {includeTransport && (
          <TextInput style={[styles.input, { marginTop: 10 }]} keyboardType="numeric" value={distance} onChangeText={setDistance} placeholder="Distância em km" />
        )}
      </View>

      <Pressable style={styles.calcBtn} onPress={calculate} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.calcBtnText}>Calcular Orçamento</Text>}
      </Pressable>

      {result && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>Orçamento</Text>
          <View style={styles.resultRow}><Text>Madeira</Text><Text>€{result.wood_cost.toFixed(2)}</Text></View>
          {result.transport_cost > 0 && (
            <View style={styles.resultRow}><Text>Transporte</Text><Text>€{result.transport_cost.toFixed(2)}</Text></View>
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
  label: { fontWeight: "600", color: "#333", marginBottom: 10 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: "#e8f5e9", marginRight: 8 },
  typeChipActive: { backgroundColor: "#2d6a4f" },
  typeText: { color: "#2d6a4f", fontWeight: "600" },
  typeTextActive: { color: "#fff" },
  hint: { color: "#888", fontSize: 13, marginTop: 6 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, fontSize: 16 },
  toggleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#2d6a4f", alignItems: "center", justifyContent: "center" },
  checkboxActive: { backgroundColor: "#2d6a4f" },
  toggleLabel: { fontSize: 15, color: "#333" },
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
