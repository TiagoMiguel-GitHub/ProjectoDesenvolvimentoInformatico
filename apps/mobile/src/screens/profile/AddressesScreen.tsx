import React, { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../../api/client";

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  postal_code: string;
  is_default: boolean;
}

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: "", street: "", city: "", postal_code: "" });
  const [error, setError] = useState("");

  async function load() {
    const { data } = await api.get("/auth/me/addresses");
    setAddresses(data);
  }

  useFocusEffect(useCallback(() => { load(); }, []));

  async function save() {
    setError("");
    if (!form.street || !form.city || !form.postal_code) {
      setError("Rua, cidade e código postal são obrigatórios");
      return;
    }
    try {
      await api.post("/auth/me/addresses", form);
      setShowForm(false);
      setForm({ label: "", street: "", city: "", postal_code: "" });
      load();
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Erro ao guardar morada");
    }
  }

  async function remove(id: string) {
    Alert.alert("Remover morada", "Tem a certeza?", [
      { text: "Cancelar" },
      { text: "Remover", style: "destructive", onPress: async () => { await api.delete(`/auth/me/addresses/${id}`); load(); } },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 12 }}>
      {addresses.map((a) => (
        <View key={a.id} style={styles.card}>
          <View style={{ flex: 1 }}>
            {a.label ? <Text style={styles.label}>{a.label}</Text> : null}
            <Text style={styles.street}>{a.street}</Text>
            <Text style={styles.city}>{a.postal_code} {a.city}</Text>
            {a.is_default && <Text style={styles.default}>Predefinida</Text>}
          </View>
          <Pressable onPress={() => remove(a.id)}><Text style={styles.removeBtn}>✕</Text></Pressable>
        </View>
      ))}

      {showForm ? (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Etiqueta (ex: Casa, Escritório)" value={form.label} onChangeText={(v) => setForm((f) => ({ ...f, label: v }))} />
          <TextInput style={styles.input} placeholder="Rua e número *" value={form.street} onChangeText={(v) => setForm((f) => ({ ...f, street: v }))} />
          <TextInput style={styles.input} placeholder="Cidade *" value={form.city} onChangeText={(v) => setForm((f) => ({ ...f, city: v }))} />
          <TextInput style={styles.input} placeholder="Código postal *" value={form.postal_code} onChangeText={(v) => setForm((f) => ({ ...f, postal_code: v }))} keyboardType="numeric" />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable style={styles.saveBtn} onPress={save}><Text style={styles.saveBtnText}>Guardar</Text></Pressable>
            <Pressable style={styles.cancelBtn} onPress={() => setShowForm(false)}><Text style={styles.cancelBtnText}>Cancelar</Text></Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.addBtn} onPress={() => setShowForm(true)}>
          <Text style={styles.addBtnText}>+ Adicionar morada</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, flexDirection: "row", alignItems: "flex-start" },
  label: { fontWeight: "700", color: "#2d6a4f", marginBottom: 2 },
  street: { fontSize: 15, color: "#333" },
  city: { fontSize: 13, color: "#888", marginTop: 2 },
  default: { marginTop: 4, fontSize: 12, color: "#2d6a4f", fontWeight: "600" },
  removeBtn: { fontSize: 18, color: "#ef4444", paddingLeft: 12 },
  form: { backgroundColor: "#fff", borderRadius: 12, padding: 16, gap: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 12, fontSize: 15 },
  error: { color: "#ef4444", fontSize: 13 },
  saveBtn: { flex: 1, backgroundColor: "#2d6a4f", borderRadius: 8, padding: 12, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700" },
  cancelBtn: { flex: 1, backgroundColor: "#f0f0f0", borderRadius: 8, padding: 12, alignItems: "center" },
  cancelBtnText: { color: "#333", fontWeight: "700" },
  addBtn: { backgroundColor: "#fff", borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#2d6a4f" },
  addBtnText: { color: "#2d6a4f", fontWeight: "700", fontSize: 15 },
});
