import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import StoreScreen from "../screens/store/StoreScreen";
import ProductDetailScreen from "../screens/store/ProductDetailScreen";
import CartScreen from "../screens/cart/CartScreen";
import CheckoutScreen from "../screens/cart/CheckoutScreen";
import OrdersScreen from "../screens/orders/OrdersScreen";
import OrderDetailScreen from "../screens/orders/OrderDetailScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import SimulatorScreen from "../screens/simulator/SimulatorScreen";
import AddressesScreen from "../screens/profile/AddressesScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function GuestScreen({ navigation, message }: { navigation: any; message: string }) {
  return (
    <View style={gs.container}>
      <Text style={gs.icon}>🔒</Text>
      <Text style={gs.title}>Precisa de conta</Text>
      <Text style={gs.message}>{message}</Text>
      <Pressable style={gs.loginBtn} onPress={() => navigation.navigate("Login")}>
        <Text style={gs.loginBtnText}>Iniciar sessão</Text>
      </Pressable>
      <Pressable style={gs.registerBtn} onPress={() => navigation.navigate("Register")}>
        <Text style={gs.registerBtnText}>Criar conta grátis</Text>
      </Pressable>
    </View>
  );
}

function CartTab({ navigation }: any) {
  const { user } = useAuth();
  if (!user) return <GuestScreen navigation={navigation} message="Inicia sessão para aceder ao carrinho e fazer encomendas." />;
  return <CartScreen navigation={navigation} />;
}

function OrdersTab({ navigation }: any) {
  const { user } = useAuth();
  if (!user) return <GuestScreen navigation={navigation} message="Inicia sessão para veres as tuas encomendas." />;
  return <OrdersScreen navigation={navigation} />;
}

function ProfileTab({ navigation }: any) {
  const { user } = useAuth();
  if (!user) return <GuestScreen navigation={navigation} message="Inicia sessão para gerir a tua conta." />;
  return <ProfileScreen navigation={navigation} />;
}

function StoreTabs() {
  const { itemCount } = useCart();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: "#2d6a4f",
        tabBarInactiveTintColor: "#aaa",
        tabBarStyle: { paddingBottom: 4 },
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            StoreTab: "storefront-outline",
            CartTab: "cart-outline",
            OrdersTab: "receipt-outline",
            ProfileTab: "person-outline",
          };
          return <Ionicons name={(icons[route.name] ?? "ellipse-outline") as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="StoreTab" component={StoreScreen} options={{ title: "Loja" }} />
      <Tab.Screen name="CartTab" component={CartTab} options={{ title: "Carrinho", tabBarBadge: itemCount > 0 ? itemCount : undefined }} />
      <Tab.Screen name="OrdersTab" component={OrdersTab} options={{ title: "Encomendas" }} />
      <Tab.Screen name="ProfileTab" component={ProfileTab} options={{ title: "Perfil" }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerTintColor: "#2d6a4f" }}>
        <Stack.Screen name="Main" component={StoreTabs} options={{ headerShown: false }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Produto" }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Finalizar Encomenda" }} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Detalhe da Encomenda" }} />
        <Stack.Screen name="Simulator" component={SimulatorScreen} options={{ title: "Simulador" }} />
        <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: "Moradas" }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Criar Conta" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const gs = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: "#f5f5f5" },
  icon: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "700", color: "#222", marginBottom: 8 },
  message: { fontSize: 15, color: "#888", textAlign: "center", marginBottom: 28, lineHeight: 22 },
  loginBtn: { backgroundColor: "#2d6a4f", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40, width: "100%", alignItems: "center", marginBottom: 10 },
  loginBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  registerBtn: { backgroundColor: "#fff", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 40, width: "100%", alignItems: "center", borderWidth: 1, borderColor: "#2d6a4f" },
  registerBtnText: { color: "#2d6a4f", fontWeight: "700", fontSize: 16 },
});
