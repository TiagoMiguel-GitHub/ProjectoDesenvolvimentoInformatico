import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { ordersApi } from "../../api/orders";
import { Order } from "../../types";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "#f59e0b" },
  confirmed: { label: "Confirmada", color: "#3b82f6" },
  preparing: { label: "Em preparação", color: "#8b5cf6" },
  out_for_delivery: { label: "Em entrega", color: "#f97316" },
  completed: { label: "Concluída", color: "#22c55e" },
  cancelled: { label: "Cancelada", color: "#ef4444" },
};

export default function OrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    const { data } = await ordersApi.myOrders();
    setOrders(data);
    setLoading(false);
    setRefreshing(false);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#2d6a4f" size="large" />;

  if (orders.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>📦</Text>
        <Text style={styles.emptyText}>Ainda não tem encomendas</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={orders}
      keyExtractor={(o) => o.id}
      contentContainerStyle={{ padding: 12, gap: 12 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} colors={["#2d6a4f"]} tintColor="#2d6a4f" />}
      renderItem={({ item }) => {
        const st = STATUS_LABELS[item.status] ?? { label: item.status, color: "#999" };
        return (
          <Pressable style={styles.card} onPress={() => navigation.navigate("OrderDetail", { orderId: item.id })}>
            <View style={styles.cardHeader}>
              <Text style={styles.orderId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
              <View style={[styles.badge, { backgroundColor: st.color + "22" }]}>
                <Text style={[styles.badgeText, { color: st.color }]}>{st.label}</Text>
              </View>
            </View>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString("pt-PT")}</Text>
            <Text style={styles.items}>{item.items?.length ?? 0} produto(s)</Text>
            <Text style={styles.total}>€{Number(item.total).toFixed(2)}</Text>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyText: { color: "#888", fontSize: 16 },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, elevation: 2, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 4 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  orderId: { fontWeight: "700", fontSize: 15, color: "#333" },
  badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { fontWeight: "700", fontSize: 12 },
  date: { color: "#888", fontSize: 13, marginBottom: 4 },
  items: { color: "#555", fontSize: 14 },
  total: { fontSize: 18, fontWeight: "700", color: "#2d6a4f", marginTop: 4 },
});
