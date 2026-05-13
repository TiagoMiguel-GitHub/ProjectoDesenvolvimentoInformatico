import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput } from "react-native";
import { useAuth } from "../../context/AuthContext";

export default function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);

  function set(key: string, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleRegister() {
    if (!form.full_name || !form.email || !form.password) return Alert.alert("Erro", "Preencha os campos obrigatórios");
    if (form.password !== form.confirm) return Alert.alert("Erro", "As passwords não coincidem");
    setLoading(true);
    try {
      await register({ full_name: form.full_name, email: form.email.trim().toLowerCase(), phone: form.phone || undefined, password: form.password });
      Alert.alert(
        "Conta criada!",
        "Verifique o seu email para confirmar a conta antes de entrar.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Erro ao registar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Criar Conta</Text>
        <TextInput style={styles.input} placeholder="Nome completo" value={form.full_name} onChangeText={(v) => set("full_name", v)} />
        <TextInput style={styles.input} placeholder="Email" keyboardType="email-address" autoCapitalize="none" value={form.email} onChangeText={(v) => set("email", v)} />
        <TextInput style={styles.input} placeholder="Telemóvel (opcional)" keyboardType="phone-pad" value={form.phone} onChangeText={(v) => set("phone", v)} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry value={form.password} onChangeText={(v) => set("password", v)} />
        <TextInput style={styles.input} placeholder="Confirmar password" secureTextEntry value={form.confirm} onChangeText={(v) => set("confirm", v)} />

        <Pressable style={styles.button} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar Conta</Text>}
        </Pressable>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Já tem conta? Entre aqui</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: "#fff", flexGrow: 1, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "700", textAlign: "center", marginBottom: 28, color: "#2d6a4f" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 16 },
  button: { backgroundColor: "#2d6a4f", borderRadius: 10, padding: 16, alignItems: "center", marginBottom: 16 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  link: { textAlign: "center", color: "#2d6a4f", fontSize: 15 },
});
