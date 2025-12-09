import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { api } from '../api/client.js';
import { Card } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { formatPeso } from '../utils/format.js';
import { theme } from '../theme.js';

export default function CartScreen({ navigation }) {
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
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { fontWeight: '700', color: theme.colors.text },
  unit: { color: theme.colors.textMuted, marginTop: 4 },
  subtotal: { color: theme.colors.primary, marginTop: 4, fontWeight: '600' },
  qtyBox: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { fontSize: 20, paddingHorizontal: 10 },
  qtyText: { minWidth: 24, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing(2), borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: '#fff' },
  total: { fontWeight: '700' },
});
