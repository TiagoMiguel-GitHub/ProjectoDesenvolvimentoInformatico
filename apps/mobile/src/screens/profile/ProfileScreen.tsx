import React, { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { authApi } from "../../api/auth";

export default function ProfileScreen({ navigation }: any) {
  const { top } = useSafeAreaInsets();
  const { user, logout, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.full_name ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await authApi.updateMe({ full_name: name.trim(), phone: phone.trim() || undefined });
      await refreshUser();
      setEditing(false);
    } catch {
      Alert.alert("Erro", "Não foi possível guardar as alterações");
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setName(user?.full_name ?? "");
    setPhone(user?.phone ?? "");
    setEditing(false);
  }

  async function handleLogout() {
    Alert.alert("Terminar sessão", "Tem a certeza?", [
      { text: "Cancelar" },
      { text: "Sair", style: "destructive", onPress: logout },
    ]);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingTop: top + 20, gap: 16 }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.full_name?.charAt(0)?.toUpperCase()}</Text>
        </View>

        {editing ? (
          <View style={styles.editForm}>
            <TextInput
              style={styles.editInput}
              value={name}
              onChangeText={setName}
              placeholder="Nome completo"
              autoFocus
            />
            <TextInput
              style={styles.editInput}
              value={phone}
              onChangeText={setPhone}
              placeholder="Telemóvel"
              keyboardType="phone-pad"
            />
            <View style={styles.editActions}>
              <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveBtnText}>{saving ? "A guardar..." : "Guardar"}</Text>
              </Pressable>
              <Pressable style={styles.cancelBtn} onPress={handleCancelEdit}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.name}>{user?.full_name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
            {user?.phone ? <Text style={styles.phone}>{user.phone}</Text> : null}
            <Pressable style={styles.editBtn} onPress={() => setEditing(true)}>
              <Text style={styles.editBtnText}>Editar perfil</Text>
            </Pressable>
          </>
        )}
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
  editBtn: { marginTop: 12, paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, borderWidth: 1, borderColor: "#2d6a4f" },
  editBtnText: { color: "#2d6a4f", fontWeight: "600", fontSize: 14 },
  editForm: { width: "100%", gap: 10, marginTop: 4 },
  editInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, fontSize: 15, backgroundColor: "#fafafa" },
  editActions: { flexDirection: "row", gap: 10 },
  saveBtn: { flex: 1, backgroundColor: "#2d6a4f", borderRadius: 10, padding: 12, alignItems: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700" },
  cancelBtn: { flex: 1, backgroundColor: "#f0f0f0", borderRadius: 10, padding: 12, alignItems: "center" },
  cancelBtnText: { color: "#333", fontWeight: "700" },
  section: { backgroundColor: "#fff", borderRadius: 12, overflow: "hidden" },
  sectionTitle: { padding: 14, fontWeight: "700", fontSize: 14, color: "#999", borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  menuItem: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15, color: "#333" },
  menuArrow: { fontSize: 22, color: "#ccc" },
  logoutBtn: { backgroundColor: "#fff", borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#ef4444" },
  logoutText: { color: "#ef4444", fontWeight: "700", fontSize: 15 },
});
