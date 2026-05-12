import React, { useState } from "react";
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { useCart } from "../../context/CartContext";
import { Product } from "../../types";

export default function ProductDetailScreen({ route, navigation }: any) {
  const product: Product = route.params.product;
  const { addItem } = useCart();
  const [qty, setQty] = useState(product.min_order_quantity);
  const { width } = useWindowDimensions();
  const imageHeight = Math.round(width * 0.65);

  function handleAdd() {
    if (qty < product.min_order_quantity) {
      return Alert.alert("Quantidade mínima", `Mínimo: ${product.min_order_quantity} ${product.unit}`);
    }
    addItem(product, qty);
    Alert.alert("Adicionado!", `${product.name} foi adicionado ao carrinho.`, [
      { text: "Continuar a comprar" },
      { text: "Ver carrinho", onPress: () => navigation.navigate("Main", { screen: "CartTab" }) },
    ]);
  }

  return (
    <ScrollView style={styles.container}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={[styles.image, { height: imageHeight }]} />
      ) : (
        <View style={[styles.image, styles.imagePlaceholder, { height: imageHeight }]}>
          <Text style={{ fontSize: 64 }}>{product.category.slug === "madeira" ? "🪵" : "🍎"}</Text>
        </View>
      )}

      <View style={styles.body}>
        <Text style={styles.category}>{product.category.name}</Text>
        <Text style={styles.name}>{product.name}</Text>

        {product.description && <Text style={styles.description}>{product.description}</Text>}

        <View style={styles.priceRow}>
          <Text style={styles.price}>€{Number(product.price_per_unit).toFixed(2)}</Text>
          <Text style={styles.unit}>por {product.unit}</Text>
        </View>

        <Text style={styles.stockLabel}>
          Stock disponível: <Text style={styles.stock}>{Number(product.stock_quantity)} {product.unit}</Text>
        </Text>

        <Text style={styles.qtyLabel}>Quantidade ({product.unit})</Text>
        <View style={styles.qtyRow}>
          <Pressable style={styles.qtyBtn} onPress={() => setQty(Math.max(product.min_order_quantity, qty - 1))}>
            <Text style={styles.qtyBtnText}>−</Text>
          </Pressable>
          <TextInput
            style={styles.qtyInput}
            keyboardType="numeric"
            value={String(qty)}
            onChangeText={(v) => setQty(Number(v) || product.min_order_quantity)}
          />
          <Pressable style={styles.qtyBtn} onPress={() => setQty(qty + 1)}>
            <Text style={styles.qtyBtnText}>+</Text>
          </Pressable>
        </View>

        <Text style={styles.subtotal}>Subtotal: €{(Number(product.price_per_unit) * qty).toFixed(2)}</Text>

        <Pressable style={styles.addBtn} onPress={handleAdd}>
          <Text style={styles.addBtnText}>Adicionar ao Carrinho</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  image: { width: "100%", height: 260 },
  imagePlaceholder: { backgroundColor: "#f0f0f0", alignItems: "center", justifyContent: "center" },
  body: { padding: 20 },
  category: { color: "#2d6a4f", fontWeight: "600", marginBottom: 4, textTransform: "uppercase", fontSize: 12 },
  name: { fontSize: 24, fontWeight: "700", color: "#222", marginBottom: 10 },
  description: { fontSize: 15, color: "#555", lineHeight: 22, marginBottom: 14 },
  priceRow: { flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 8 },
  price: { fontSize: 28, fontWeight: "700", color: "#2d6a4f" },
  unit: { fontSize: 15, color: "#888" },
  stockLabel: { color: "#555", marginBottom: 20, fontSize: 14 },
  stock: { fontWeight: "700", color: "#333" },
  qtyLabel: { fontSize: 15, fontWeight: "600", marginBottom: 8, color: "#333" },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  qtyBtn: { width: 40, height: 40, borderRadius: 8, backgroundColor: "#e8f5e9", alignItems: "center", justifyContent: "center" },
  qtyBtnText: { fontSize: 22, color: "#2d6a4f", fontWeight: "700" },
  qtyInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, textAlign: "center", fontSize: 18, padding: 8 },
  subtotal: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 20 },
  addBtn: { backgroundColor: "#2d6a4f", borderRadius: 12, padding: 16, alignItems: "center" },
  addBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
