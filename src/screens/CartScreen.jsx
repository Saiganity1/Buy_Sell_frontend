import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { api } from '../api/client.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { formatPeso } from '../utils/format.js';
import { useCurrentTheme } from '../hooks/useCurrentTheme.js';

export default function CartScreen({ navigation }) {
  const theme = useCurrentTheme();
  const styles = getStyles(theme);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const { data } = await api.get('/cart/');
    setItems(data);
  };

  useEffect(() => { load(); }, []);

  // Reload whenever the tab/screen gains focus to reflect newly added items
  useEffect(() => {
    const unsub = navigation?.addListener?.('focus', () => {
      load();
    });
    return () => { unsub && unsub(); };
  }, [navigation]);

  const updateQty = async (id, quantity) => {
    if (quantity < 1) quantity = 1;
    await api.patch(`/cart/${id}/`, { quantity });
    load();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try { await load(); } finally { setRefreshing(false); }
  };

  const checkout = async () => {
    try {
      setLoading(true);
      const { data } = await api.post('/cart/checkout/');
      Alert.alert('Order Created', `Order #${data.id}`);
      load();
    } finally {
      setLoading(false);
    }
  };

  const total = items.reduce((sum, it) => sum + Number(it.product.price) * it.quantity, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.brand}>MichaelPlace</Text>
        <Text style={styles.brandSub}>Your Cart</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: theme.spacing(2) }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => {
          const unit = Number(item.product.price);
          const lineTotal = unit * item.quantity;
          return (
            <Card style={{ marginBottom: theme.spacing(2) }}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>
                    {item.product.title}{item.variant?.name ? ` — ${item.variant.name}` : ''}
                  </Text>
                  <Text style={styles.unit}>{formatPeso(unit)} × {item.quantity}</Text>
                  <Text style={styles.subtotal}>{formatPeso(lineTotal)}</Text>
                </View>
                <View style={styles.qtyBox}>
                  <TouchableOpacity onPress={() => updateQty(item.id, item.quantity - 1)}><Text style={styles.qtyBtn}>-</Text></TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQty(item.id, item.quantity + 1)}><Text style={styles.qtyBtn}>+</Text></TouchableOpacity>
                </View>
              </View>
            </Card>
          );
        }}
      />
      <View style={styles.footer}>
        <Text style={styles.total}>Total: {formatPeso(total)}</Text>
        <Button title="Checkout" onPress={checkout} disabled={loading || items.length === 0} />
      </View>
    </SafeAreaView>
  );
}
const getStyles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    paddingVertical: 18,
    backgroundColor: theme.colors.headerBg,
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  brand: { color: theme.colors.primary, fontSize: 22, fontWeight: '700' },
  brandSub: { color: theme.colors.primarySoft, fontSize: 12, marginTop: 4 },

  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontWeight: '700', color: theme.colors.text },
  unit: { color: theme.colors.textMuted, marginTop: 4 },
  subtotal: { color: theme.colors.primary, marginTop: 4, fontWeight: '600' },
  qtyBox: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { fontSize: 20, paddingHorizontal: 10, color: theme.colors.text },
  qtyText: { minWidth: 24, textAlign: 'center', color: theme.colors.text },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing(2), borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.cardBg },
  total: { fontWeight: '700', color: theme.colors.text },
});
