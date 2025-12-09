import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { api } from '../api/client.js';
import { resolveImageUri } from '../utils/resolveImage.js';
import { useAuth } from '../api/AuthContext.jsx';
import { useIsFocused } from '@react-navigation/native';
import { relativeTimeFromNow } from '../utils/time.js';
import { formatPeso } from '../utils/format.js';
import { theme } from '../theme.js';

export default function MyListingsScreen({ navigation }) {
  const { user } = useAuth();
  const isFocused = useIsFocused();
  const [items, setItems] = useState([]);

  const load = async () => {
    if (!user) return;
    const { data } = await api.get('/products/', { params: { seller_id: user.id } });
    setItems(data);
  };

  useEffect(() => { load(); }, [user?.id]);
  useEffect(() => { if (isFocused) { load(); } }, [isFocused]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.brand}>MichaelPlace</Text>
        <Text style={styles.brandSub}>My Listings</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {resolveImageUri(item) ? (
              <Image source={{ uri: resolveImageUri(item) }} style={styles.thumb} />
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0f1724' },
  header: {
    paddingVertical: 18,
    backgroundColor: '#072033',
    alignItems: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  brand: { color: '#9be3ff', fontSize: 22, fontWeight: '700' },
  brandSub: { color: '#d0f7ff', fontSize: 12, marginTop: 4 },

  row: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontWeight: '600' },
  subRow: { marginTop: 4 },
  price: { color: '#0b7285', fontWeight: '600' },
  dot: { color: '#888' },
  time: { color: '#888' },
  stock: { color: '#666' },
  btn: { backgroundColor: '#7dd3fc', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  btnText: { color: '#06283D', fontWeight: '600' },
  thumb: { width: 48, height: 48, borderRadius: 6, marginRight: 12, backgroundColor: '#f2f2f2' },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
});
