import React from 'react';
import { Button as RNButton } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import SellScreen from '../screens/SellScreen';
import CartScreen from '../screens/CartScreen';
import ChatScreen from '../screens/ChatScreen';
import MessagesScreen from '../screens/MessagesScreen';
import AdminUsersScreen from '../screens/AdminUsersScreen';
import AdminUserProductsScreen from '../screens/AdminUserProductsScreen';
import { useAuth } from '../api/AuthContext';
import MyListingsScreen from '../screens/MyListingsScreen';
import EditListingScreen from '../screens/EditListingScreen';
import { theme } from '../theme';

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
            route.name === 'Home'
              ? 'home'
              : route.name === 'Sell'
              ? 'add-circle'
              : route.name === 'Cart'
              ? 'cart'
              : route.name === 'Messages'
              ? 'chatbubble'
              : route.name === 'MyListings'
              ? 'albums'
              : 'ellipsis-horizontal';
          return <Ionicons name={name as any} size={size} color={color} />;
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
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Create Account' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Main"
            component={TabsNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
            options={{ title: 'Product' }}
          />
          <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
          <Stack.Screen
            name="AdminUserProducts"
            component={AdminUserProductsScreen}
            options={{ title: 'User Listings' }}
          />
          <Stack.Screen
            name="EditListing"
            component={EditListingScreen}
            options={{ title: 'Edit Listing' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
