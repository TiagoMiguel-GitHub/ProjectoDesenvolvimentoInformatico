import React from "react";
import { FlatList, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useCart } from "../../context/CartContext";

export default function CartScreen({ navigation }: any) {
  const { items, updateQuantity, removeItem, total } = useCart();

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyText}>O seu carrinho está vazio</Text>
        <Pressable style={styles.shopBtn} onPress={() => navigation.navigate("StoreTab")}>
          <Text style={styles.shopBtnText}>Ir às compras</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.product.id}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.product.image_url ? (
              <Image source={{ uri: item.product.image_url }} style={styles.img} />
            ) : (
              <View style={[styles.img, styles.imgPlaceholder]}>
                <Text style={{ fontSize: 28 }}>{item.product.category.slug === "madeira" ? "🪵" : "🍎"}</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={2}>{item.product.name}</Text>
              <Text style={styles.price}>€{(Number(item.product.price_per_unit) * item.quantity).toFixed(2)}</Text>
              <View style={styles.qtyRow}>
                <Pressable onPress={() => updateQuantity(item.product.id, item.quantity - 1)} style={styles.qBtn}>
                  <Text style={styles.qBtnText}>−</Text>
                </Pressable>
                <Text style={styles.qty}>{item.quantity} {item.product.unit}</Text>
                <Pressable onPress={() => updateQuantity(item.product.id, item.quantity + 1)} style={styles.qBtn}>
                  <Text style={styles.qBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
            <Pressable onPress={() => removeItem(item.product.id)} style={styles.del}>
              <Text style={{ fontSize: 20 }}>🗑️</Text>
            </Pressable>
          </View>
        )}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.total}>€{total.toFixed(2)}</Text>
        </View>
        <Pressable style={styles.checkoutBtn} onPress={() => navigation.navigate("Checkout")}>
          <Text style={styles.checkoutBtnText}>Finalizar Encomenda</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 18, color: "#888", marginBottom: 24 },
  shopBtn: { backgroundColor: "#2d6a4f", borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  shopBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  row: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", alignItems: "center", padding: 8, gap: 10 },
  img: { width: 70, height: 70, borderRadius: 8 },
  imgPlaceholder: { backgroundColor: "#f0f0f0", alignItems: "center", justifyContent: "center" },
  info: { flex: 1 },
  name: { fontWeight: "600", color: "#333", marginBottom: 4, fontSize: 14 },
  price: { color: "#2d6a4f", fontWeight: "700", fontSize: 16, marginBottom: 6 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  qBtn: { width: 36, height: 36, backgroundColor: "#e8f5e9", borderRadius: 6, alignItems: "center", justifyContent: "center" },
  qBtnText: { fontSize: 18, color: "#2d6a4f", fontWeight: "700" },
  qty: { fontSize: 14, fontWeight: "600", color: "#333" },
  del: { padding: 8 },
  footer: { backgroundColor: "#fff", padding: 20, borderTopWidth: 1, borderTopColor: "#eee" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  totalLabel: { fontSize: 17, color: "#555" },
  total: { fontSize: 22, fontWeight: "700", color: "#2d6a4f" },
  checkoutBtn: { backgroundColor: "#2d6a4f", borderRadius: 12, padding: 16, alignItems: "center" },
  checkoutBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
