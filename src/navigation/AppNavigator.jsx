import React from 'react';
import { Button as RNButton } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import LoginScreen from '../screens/LoginScreen.jsx';
import RegisterScreen from '../screens/RegisterScreen.jsx';
import HomeScreen from '../screens/HomeScreen.jsx';
import ProductDetailScreen from '../screens/ProductDetailScreen.jsx';
import SellScreen from '../screens/SellScreen.jsx';
import CartScreen from '../screens/CartScreen.jsx';
import ChatScreen from '../screens/ChatScreen.jsx';
import MessagesScreen from '../screens/MessagesScreen.jsx';
import AdminUsersScreen from '../screens/AdminUsersScreen.jsx';
import AdminUserProductsScreen from '../screens/AdminUserProductsScreen.jsx';
import { useAuth } from '../api/AuthContext.jsx';
import MyListingsScreen from '../screens/MyListingsScreen.jsx';
import EditListingScreen from '../screens/EditListingScreen.jsx';
import { theme } from '../theme.js';

const Stack = createNativeStackNavigator();
const Tabs = createBottomTabNavigator();

function TabsNavigator() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerRight: () => <RNButton title="Logout" onPress={logout} />,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { backgroundColor: '#fff' },
        tabBarIcon: ({ color, size }) => {
          const name =
            route.name === 'Home' ? 'home' :
            route.name === 'Sell' ? 'add-circle' :
            route.name === 'Cart' ? 'cart' :
            route.name === 'Messages' ? 'chatbubble' :
            route.name === 'MyListings' ? 'albums' : 'ellipsis-horizontal';
          return <Ionicons name={name} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} />
      <Tabs.Screen name="Sell" component={SellScreen} />
      <Tabs.Screen name="Cart" component={CartScreen} />
      <Tabs.Screen name="Messages" component={MessagesScreen} />
      <Tabs.Screen name="MyListings" component={MyListingsScreen} />
      {isAdmin && <Tabs.Screen name="Users" component={AdminUsersScreen} />}
    </Tabs.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerShadowVisible: true,
        headerTintColor: theme.colors.text,
      }}
    >
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Create Account' }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={TabsNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Product' }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
          <Stack.Screen name="AdminUserProducts" component={AdminUserProductsScreen} options={{ title: 'User Listings' }} />
          <Stack.Screen name="EditListing" component={EditListingScreen} options={{ title: 'Edit Listing' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
