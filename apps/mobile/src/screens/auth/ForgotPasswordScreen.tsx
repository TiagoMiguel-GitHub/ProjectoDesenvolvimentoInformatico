import React, { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput } from "react-native";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleReset() {
    if (!email) return Alert.alert("Erro", "Insira o seu email");
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase());
      if (error) throw error;
      Alert.alert(
        "Email enviado",
        "Verifique a sua caixa de entrada e siga as instruções para redefinir a password.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert("Erro", e?.message || "Não foi possível enviar o email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <Text style={styles.title}>Recuperar password</Text>
      <Text style={styles.subtitle}>Insira o email associado à sua conta e enviamos um link para redefinir a password.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <Pressable style={styles.button} onPress={handleReset} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enviar link</Text>}
      </Pressable>

      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.backLink}>Voltar ao login</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "700", color: "#2d6a4f", marginBottom: 10 },
  subtitle: { fontSize: 15, color: "#666", lineHeight: 22, marginBottom: 28 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 14, marginBottom: 14, fontSize: 16 },
  button: { backgroundColor: "#2d6a4f", borderRadius: 10, padding: 16, alignItems: "center", marginBottom: 16 },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  backLink: { textAlign: "center", color: "#888", fontSize: 14 },
});
