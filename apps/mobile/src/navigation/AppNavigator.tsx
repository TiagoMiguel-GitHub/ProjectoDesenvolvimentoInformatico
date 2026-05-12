import React from "react";
import { ActivityIndicator, View } from "react-native";
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
      <Tab.Screen name="CartTab" component={CartScreen} options={{ title: "Carrinho", tabBarBadge: itemCount > 0 ? itemCount : undefined }} />
      <Tab.Screen name="OrdersTab" component={OrdersScreen} options={{ title: "Encomendas" }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: "Perfil" }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

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
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: "Criar Conta" }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={StoreTabs} options={{ headerShown: false }} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "Produto" }} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ title: "Finalizar Encomenda" }} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: "Detalhe da Encomenda" }} />
            <Stack.Screen name="Simulator" component={SimulatorScreen} options={{ title: "Simulador" }} />
            <Stack.Screen name="Addresses" component={AddressesScreen} options={{ title: "Moradas" }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
