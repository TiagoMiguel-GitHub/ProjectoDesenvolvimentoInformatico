import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { api } from "../../api/client";
import { ordersApi } from "../../api/orders";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { Address, TimeSlot } from "../../types";

const PAYMENT_OPTIONS = [
  { key: "cash_on_delivery", label: "💵 Pagamento na entrega" },
  { key: "mbway", label: "📱 MB Way" },
  { key: "multibanco", label: "🏧 Multibanco" },
];

export default function CheckoutScreen({ navigation }: any) {
  const { user } = useAuth();
  const { items, total, clear } = useCart();

  const [fulfillment, setFulfillment] = useState<"delivery" | "pickup">("delivery");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/auth/me/addresses").then(({ data }) => {
      setAddresses(data);
      const def = data.find((a: Address) => a.is_default) ?? data[0] ?? null;
      setSelectedAddress(def);
    });
  }, []);

  useEffect(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    ordersApi.slots(fmt(today), fmt(nextWeek), fulfillment).then(({ data }) => setSlots(data));
  }, [fulfillment]);

  useEffect(() => {
    if (fulfillment === "delivery" && selectedAddress) {
      ordersApi.calculateDeliveryCost(selectedAddress.postal_code, total).then(({ data }) => {
        setDeliveryCost(data.delivery_cost ?? 0);
      });
    } else {
      setDeliveryCost(0);
    }
  }, [fulfillment, selectedAddress, total]);

  async function placeOrder() {
    if (fulfillment === "delivery" && !selectedAddress) return Alert.alert("Erro", "Selecione uma morada de entrega");
    if (!selectedSlot) return Alert.alert("Erro", "Selecione um horário");
    setLoading(true);
    try {
      const { data: order } = await ordersApi.create({
        address_id: fulfillment === "delivery" ? selectedAddress?.id : undefined,
        time_slot_id: selectedSlot.id,
        fulfillment_type: fulfillment,
        payment_method: paymentMethod,
        items: items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })),
        notes: notes || undefined,
      });
      clear();
      navigation.replace("OrderDetail", { orderId: order.id });
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      const msg = Array.isArray(detail)
        ? detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ")
        : detail || e?.message || "Não foi possível criar a encomenda";
      console.error("Order error:", JSON.stringify(e?.response?.data));
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Fulfillment type */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tipo de entrega</Text>
        <View style={styles.toggle}>
          {(["delivery", "pickup"] as const).map((t) => (
            <Pressable key={t} style={[styles.toggleBtn, fulfillment === t && styles.toggleActive]} onPress={() => setFulfillment(t)}>
              <Text style={[styles.toggleText, fulfillment === t && styles.toggleTextActive]}>
                {t === "delivery" ? "🚚 Entrega" : "🏪 Levantamento"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Address (delivery only) */}
      {fulfillment === "delivery" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Morada de entrega</Text>
          {addresses.map((addr) => (
            <Pressable key={addr.id} style={[styles.addrRow, selectedAddress?.id === addr.id && styles.addrSelected]} onPress={() => setSelectedAddress(addr)}>
              <Text style={styles.addrText}>{addr.label || addr.street}</Text>
              <Text style={styles.addrSub}>{addr.street}, {addr.city} {addr.postal_code}</Text>
            </Pressable>
          ))}
          {!addresses.length && <Text style={styles.hint}>Adicione uma morada no seu perfil</Text>}
          {deliveryCost > 0 && <Text style={styles.deliveryCost}>Custo de entrega: €{deliveryCost.toFixed(2)}</Text>}
          {deliveryCost === 0 && selectedAddress && <Text style={styles.freeDelivery}>🎉 Entrega gratuita!</Text>}
        </View>
      )}

      {/* Time slot */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Horário</Text>
        {slots.filter((s) => s.is_available).length === 0 && (
          <Text style={styles.hint}>Sem horários disponíveis esta semana</Text>
        )}
        {slots.filter((s) => s.is_available).map((slot) => (
          <Pressable key={slot.id} style={[styles.slotRow, selectedSlot?.id === slot.id && styles.slotSelected]} onPress={() => setSelectedSlot(slot)}>
            <Text style={styles.slotDate}>{slot.slot_date}</Text>
            <Text style={styles.slotTime}>{slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}</Text>
          </Pressable>
        ))}
      </View>

      {/* Payment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Método de pagamento</Text>
        {PAYMENT_OPTIONS.map((opt) => (
          <Pressable key={opt.key} style={[styles.payRow, paymentMethod === opt.key && styles.paySelected]} onPress={() => setPaymentMethod(opt.key)}>
            <Text style={styles.payText}>{opt.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notas (opcional)</Text>
        <TextInput style={styles.notesInput} placeholder="Ex: deixar no portão..." multiline value={notes} onChangeText={setNotes} />
      </View>

      {/* Summary */}
      <View style={styles.summary}>
        <View style={styles.summRow}><Text>Subtotal</Text><Text>€{total.toFixed(2)}</Text></View>
        <View style={styles.summRow}><Text>Entrega</Text><Text>€{deliveryCost.toFixed(2)}</Text></View>
        <View style={[styles.summRow, { marginTop: 8 }]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>€{(total + deliveryCost).toFixed(2)}</Text>
        </View>
      </View>

      <Pressable style={styles.orderBtn} onPress={placeOrder} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.orderBtnText}>Confirmar Encomenda</Text>}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  section: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  sectionTitle: { fontWeight: "700", fontSize: 16, color: "#333", marginBottom: 12 },
  toggle: { flexDirection: "row", gap: 10 },
  toggleBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: "#ccc", alignItems: "center" },
  toggleActive: { backgroundColor: "#2d6a4f", borderColor: "#2d6a4f" },
  toggleText: { fontWeight: "600", color: "#555" },
  toggleTextActive: { color: "#fff" },
  addrRow: { padding: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, marginBottom: 8 },
  addrSelected: { borderColor: "#2d6a4f", backgroundColor: "#f0faf4" },
  addrText: { fontWeight: "600", color: "#333" },
  addrSub: { color: "#777", fontSize: 13 },
  hint: { color: "#999", fontSize: 13 },
  deliveryCost: { color: "#e07b39", fontWeight: "600", marginTop: 8 },
  freeDelivery: { color: "#2d6a4f", fontWeight: "600", marginTop: 8 },
  slotRow: { padding: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, marginBottom: 8, flexDirection: "row", justifyContent: "space-between" },
  slotSelected: { borderColor: "#2d6a4f", backgroundColor: "#f0faf4" },
  slotDate: { fontWeight: "600", color: "#333" },
  slotTime: { color: "#2d6a4f", fontWeight: "600" },
  payRow: { padding: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 10, marginBottom: 8 },
  paySelected: { borderColor: "#2d6a4f", backgroundColor: "#f0faf4" },
  payText: { fontWeight: "600", color: "#333" },
  notesInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 12, height: 80, textAlignVertical: "top" },
  summary: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  summRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  totalLabel: { fontWeight: "700", fontSize: 17, color: "#333" },
  totalValue: { fontWeight: "700", fontSize: 20, color: "#2d6a4f" },
  orderBtn: { backgroundColor: "#2d6a4f", borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 32 },
  orderBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
});
