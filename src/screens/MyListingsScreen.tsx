import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../api/AuthContext';
import { useIsFocused } from '@react-navigation/native';
import { relativeTimeFromNow } from '../utils/time';
import { formatPeso } from '../utils/format';
import { theme } from '../theme';

interface Product { id: number; title: string; price: string; created_at?: string; has_variants?: boolean; stock?: number; image?: string; image_url?: string }

export default function MyListingsScreen({ navigation }: any) {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [items, setItems] = useState<Product[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await api.get('/products/', { params: { seller_id: user.id } });
    setItems(data);
  };

  useEffect(() => { load(); }, [user?.id]);
  useEffect(() => { if (isFocused) { load(); } }, [isFocused]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <FlatList
        data={items}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.image || item.image_url ? (
              <Image source={{ uri: (item.image || item.image_url) as string }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subRow}>
                <Text style={styles.price}>{formatPeso(Number(item.price))}</Text>
                {item.created_at ? <Text style={styles.dot}> • </Text> : null}
                {item.created_at ? (
                  <Text style={styles.time}>{relativeTimeFromNow(item.created_at)}</Text>
                ) : null}
                {!item.has_variants ? (
                  <Text style={styles.dot}> • </Text>
                ) : null}
                {!item.has_variants ? (
                  <Text style={styles.stock}>stock: {item.stock ?? 0}</Text>
                ) : null}
              </Text>
            </View>
            <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('EditListing', { productId: item.id })}>
              <Text style={styles.btnText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontWeight: '600' },
  subRow: { marginTop: 4 },
  price: { color: '#1877F2', fontWeight: '600' },
  dot: { color: '#888' },
  time: { color: '#888' },
  stock: { color: '#666' },
  btn: { backgroundColor: '#1877F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnText: { color: '#fff', fontWeight: '600' },
  thumb: { width: 48, height: 48, borderRadius: 6, marginRight: 12, backgroundColor: '#f2f2f2' },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
});
