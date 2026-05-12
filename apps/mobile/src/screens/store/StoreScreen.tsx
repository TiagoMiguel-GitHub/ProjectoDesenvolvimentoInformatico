import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from "react-native";
import { productsApi } from "../../api/products";
import { Category, Product } from "../../types";

export default function StoreScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const numColumns = width >= 600 ? 3 : 2;
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    productsApi.categories().then(({ data }) => setCategories(data));
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productsApi.list({
        category_id: selectedCategory ?? undefined,
        search: search || undefined,
        in_stock: true,
      });
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <View style={styles.container}>
      <TextInput style={styles.search} placeholder="🔍  Pesquisar..." value={search} onChangeText={setSearch} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cats}>
        <Pressable style={[styles.catChip, !selectedCategory && styles.catActive]} onPress={() => setSelectedCategory(null)}>
          <Text style={[styles.catText, !selectedCategory && styles.catTextActive]}>Todos</Text>
        </Pressable>
        {categories.map((c) => (
          <Pressable key={c.id} style={[styles.catChip, selectedCategory === c.id && styles.catActive]} onPress={() => setSelectedCategory(c.id)}>
            <Text style={[styles.catText, selectedCategory === c.id && styles.catTextActive]}>{c.name}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color="#2d6a4f" size="large" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={numColumns}
          key={numColumns}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={{ padding: 12, gap: 12 }}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => navigation.navigate("ProductDetail", { product: item })}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.cardImg} />
              ) : (
                <View style={[styles.cardImg, styles.cardImgPlaceholder]}>
                  <Text style={{ fontSize: 32 }}>{item.category.slug === "madeira" ? "🪵" : "🍎"}</Text>
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.cardPrice}>€{Number(item.price_per_unit).toFixed(2)}/{item.unit}</Text>
                <Text style={styles.cardStock}>{Number(item.stock_quantity) > 0 ? "Em stock" : "Esgotado"}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  search: { margin: 12, backgroundColor: "#fff", borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1, borderColor: "#e0e0e0" },
  cats: { paddingHorizontal: 12, marginBottom: 4 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#e8f5e9", marginRight: 8 },
  catActive: { backgroundColor: "#2d6a4f" },
  catText: { color: "#2d6a4f", fontWeight: "600" },
  catTextActive: { color: "#fff" },
  card: { flex: 1, backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", elevation: 2, shadowColor: "#000", shadowOpacity: 0.07, shadowRadius: 4 },
  cardImg: { width: "100%", height: 110 },
  cardImgPlaceholder: { backgroundColor: "#f0f0f0", alignItems: "center", justifyContent: "center" },
  cardBody: { padding: 10 },
  cardName: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 4 },
  cardPrice: { fontSize: 15, fontWeight: "700", color: "#2d6a4f" },
  cardStock: { fontSize: 11, color: "#888", marginTop: 2 },
});
