import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth();

  async function handleLogout() {
    Alert.alert("Terminar sessão", "Tem a certeza?", [
      { text: "Cancelar" },
      { text: "Sair", style: "destructive", onPress: logout },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.full_name?.charAt(0)?.toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user?.full_name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {user?.phone && <Text style={styles.phone}>{user.phone}</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conta</Text>
        <MenuItem icon="📦" label="As minhas encomendas" onPress={() => navigation.navigate("OrdersTab" as never)} />
        <MenuItem icon="📍" label="Moradas guardadas" onPress={() => navigation.getParent()?.navigate("Addresses")} />
        <MenuItem icon="🧮" label="Simulador de Orçamento" onPress={() => navigation.getParent()?.navigate("Simulator")} />
      </View>

      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Terminar sessão</Text>
      </Pressable>
    </ScrollView>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuArrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 24 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "#2d6a4f", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "700" },
  name: { fontSize: 20, fontWeight: "700", color: "#222" },
  email: { color: "#888", marginTop: 4 },
  phone: { color: "#888", marginTop: 2 },
  section: { backgroundColor: "#fff", borderRadius: 12, overflow: "hidden" },
  sectionTitle: { padding: 14, fontWeight: "700", fontSize: 14, color: "#999", borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, color: "#333" },
  menuArrow: { fontSize: 22, color: "#ccc" },
  logoutBtn: { backgroundColor: "#fff", borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#ef4444" },
  logoutText: { color: "#ef4444", fontWeight: "700", fontSize: 15 },
});
