import React, { useCallback, useState } from "react";
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ordersApi } from "../../api/orders";
import { Order } from "../../types";

const STEPS = ["pending", "confirmed", "preparing", "out_for_delivery", "completed"];
const STEP_LABELS: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  preparing: "Em preparação",
  out_for_delivery: "Em entrega",
  completed: "Concluída",
  cancelled: "Cancelada",
};

export default function OrderDetailScreen({ route }: any) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    const { data } = await ordersApi.myOrder(orderId);
    setOrder(data);
    setLoading(false);
    setRefreshing(false);
  }

  useFocusEffect(useCallback(() => { load(); }, [orderId]));

  if (loading || !order) return <ActivityIndicator style={{ flex: 1 }} color="#2d6a4f" size="large" />;

  const currentStep = STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 16, gap: 16 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={["#2d6a4f"]} tintColor="#2d6a4f" />}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estado da encomenda</Text>

        {isCancelled ? (
          <View style={styles.cancelledBadge}>
            <Text style={styles.cancelledText}>❌  Encomenda cancelada</Text>
          </View>
        ) : (
          <View style={styles.steps}>
            {STEPS.map((step, i) => (
              <View key={step} style={styles.stepRow}>
                <View style={[styles.dot, i <= currentStep && styles.dotActive]} />
                {i < STEPS.length - 1 && <View style={[styles.line, i < currentStep && styles.lineActive]} />}
                <Text style={[styles.stepLabel, i <= currentStep && styles.stepLabelActive]}>{STEP_LABELS[step]}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Produtos</Text>
        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.product.name}</Text>
            <Text style={styles.itemQty}>{item.quantity} {item.product.unit}</Text>
            <Text style={styles.itemPrice}>€{Number(item.total_price).toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.itemRow}>
          <Text style={styles.itemName}>Entrega</Text>
          <Text style={styles.itemPrice}>€{Number(order.delivery_cost).toFixed(2)}</Text>
        </View>
        <View style={styles.itemRow}>
          <Text style={[styles.itemName, { fontWeight: "700" }]}>Total</Text>
          <Text style={[styles.itemPrice, { fontWeight: "700", color: "#2d6a4f" }]}>€{Number(order.total).toFixed(2)}</Text>
        </View>
      </View>

      {order.payment_method === "multibanco" && order.multibanco_entity && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Referência Multibanco</Text>
          <Text style={styles.mbRow}>Entidade: <Text style={styles.mbValue}>{order.multibanco_entity}</Text></Text>
          <Text style={styles.mbRow}>Referência: <Text style={styles.mbValue}>{order.multibanco_reference}</Text></Text>
          <Text style={styles.mbRow}>Valor: <Text style={styles.mbValue}>€{Number(order.total).toFixed(2)}</Text></Text>
        </View>
      )}

      {order.address && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Morada de entrega</Text>
          <Text style={styles.addrText}>{order.address.street}, {order.address.city}</Text>
          <Text style={styles.addrText}>{order.address.postal_code}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Histórico</Text>
        {order.status_history.map((h, i) => (
          <View key={i} style={styles.histRow}>
            <View style={styles.histDot} />
            <View>
              <Text style={styles.histStatus}>{STEP_LABELS[h.status] ?? h.status}</Text>
              <Text style={styles.histDate}>{new Date(h.created_at).toLocaleString("pt-PT")}</Text>
              {h.note && <Text style={styles.histNote}>{h.note}</Text>}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  sectionTitle: { fontWeight: "700", fontSize: 16, color: "#333", marginBottom: 14 },
  steps: { gap: 0 },
  stepRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  dot: { width: 16, height: 16, borderRadius: 8, backgroundColor: "#ddd", marginTop: 2, flexShrink: 0 },
  dotActive: { backgroundColor: "#2d6a4f" },
  dotCancelled: { backgroundColor: "#ef4444" },
  line: { position: "absolute", left: 7, top: 18, width: 2, height: 24, backgroundColor: "#ddd" },
  lineActive: { backgroundColor: "#2d6a4f" },
  stepLabel: { color: "#aaa", fontSize: 14 },
  stepLabelActive: { color: "#2d6a4f", fontWeight: "600" },
  itemRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8, alignItems: "center" },
  itemName: { flex: 1, color: "#333", fontSize: 14 },
  itemQty: { color: "#888", fontSize: 13, marginHorizontal: 8 },
  itemPrice: { fontWeight: "600", color: "#333", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#eee", marginVertical: 8 },
  mbRow: { fontSize: 15, color: "#555", marginBottom: 6 },
  mbValue: { fontWeight: "700", color: "#333" },
  addrText: { color: "#555", fontSize: 15 },
  histRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  histDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#2d6a4f", marginTop: 4, flexShrink: 0 },
  histStatus: { fontWeight: "600", color: "#333" },
  histDate: { color: "#888", fontSize: 12 },
  histNote: { color: "#555", fontSize: 13, marginTop: 2 },
  cancelledBadge: { backgroundColor: "#fee2e2", borderRadius: 10, padding: 14, alignItems: "center" },
  cancelledText: { color: "#dc2626", fontWeight: "700", fontSize: 15 },
});
