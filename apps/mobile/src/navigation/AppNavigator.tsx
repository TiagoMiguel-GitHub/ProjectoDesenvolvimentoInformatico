// Estrutura de navegação da aplicação mobile.
// Usa uma Stack Navigator raiz com um Tab Navigator encaixado como ecrã principal.
// Ecrãs que exigem login mostram um ecrã de "guest" em vez de redirecionar.
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
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
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

// Ecrã genérico mostrado a utilizadores não autenticados que tentam aceder a áreas protegidas
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

// Wrapper do tab "Carrinho" — passa a prop navigation ao CartScreen
function CartTab({ navigation }: any) {
  return <CartScreen navigation={navigation} />;
}

// Tab "Encomendas" — requer login
function OrdersTab({ navigation }: any) {
  const { user } = useAuth();
  if (!user) return <GuestScreen navigation={navigation} message="Inicia sessão para veres as tuas encomendas." />;
  return <OrdersScreen navigation={navigation} />;
}

// Tab "Perfil" — mostra GuestProfileScreen se não autenticado
function ProfileTab({ navigation }: any) {
  const { user } = useAuth();
  if (!user) return <GuestProfileScreen navigation={navigation} />;
  return <ProfileScreen navigation={navigation} />;
}

// Versão do perfil para utilizadores não autenticados.
// Ainda dá acesso ao Simulador sem login.
// Nota: usa `navigation.navigate("Simulator" as never)` em vez de `getParent()?.navigate()`
// porque em React Navigation v7 o navigate() já sobe automaticamente na árvore de navigators.
function GuestProfileScreen({ navigation }: { navigation: any }) {
  return (
    <View style={gs.container}>
      <Text style={gs.icon}>🔒</Text>
      <Text style={gs.title}>A tua conta</Text>
      <Pressable style={gs.loginBtn} onPress={() => navigation.navigate("Login")}>
        <Text style={gs.loginBtnText}>Iniciar sessão</Text>
      </Pressable>
      <Pressable style={gs.registerBtn} onPress={() => navigation.navigate("Register")}>
        <Text style={gs.registerBtnText}>Criar conta grátis</Text>
      </Pressable>
      <View style={gs.divider} />
      <Pressable style={gs.simBtn} onPress={() => navigation.navigate("Simulator" as never)}>
        <Text style={gs.simBtnText}>🧮  Simulador de Orçamento</Text>
      </Pressable>
    </View>
  );
}

// Bottom Tab Navigator com 4 separadores.
// O badge do carrinho mostra o número de itens quando há algum no carrinho.
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

// Componente raiz de navegação.
// Aguarda a verificação da sessão (loading) antes de montar o NavigationContainer,
// evitando que o utilizador veja um flash do ecrã de login antes do estado carregar.
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
      {/* Stack raiz: Tab principal + ecrãs de detalhe acessíveis a partir de qualquer tab */}
      <Stack.Navigator screenOptions={{ headerTintColor: "#2d6a4f" }}>
        <Stack.Screen name="Main" component={StoreTabs} options={{ headerShown: false }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Produto" }} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Finalizar Encomenda" }} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Detalhe da Encomenda" }} />
        <Stack.Screen name="Simulator" component={SimulatorScreen} options={{ title: "Simulador" }} />
        <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: "Moradas" }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Criar Conta" }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: "Recuperar Password" }} />
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
  divider: { width: "100%", height: 1, backgroundColor: "#e0e0e0", marginVertical: 24 },
  simBtn: { backgroundColor: "#f0faf4", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 24, width: "100%", alignItems: "center", borderWidth: 1, borderColor: "#2d6a4f" },
  simBtnText: { color: "#2d6a4f", fontWeight: "700", fontSize: 15 },
});
