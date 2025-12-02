import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../api/client.js';
import { relativeTimeFromNow } from '../utils/time.js';
import { formatPeso } from '../utils/format.js';
import { theme } from '../theme.js';
import { Snack } from '../components/ui/Snack.jsx';

export default function AdminUserProductsScreen({ route, navigation }) {
  const { userId, username } = route.params;
  const [products, setProducts] = useState([]);

  const load = async () => {
    const { data } = await api.get(`/products/`, { params: { seller_id: userId } });
    setProducts(data);
  };

  useEffect(() => { load(); }, []);

  const [snack, setSnack] = useState(null);

  const doDelete = async (id) => {
    try {
      await api.delete(`/products/${id}/`);
      setSnack({ msg: 'Listing deleted', type: 'success' });
      load();
    } catch (e) {
      const detail = e?.response?.data?.detail || e?.message || 'Unable to delete.';
      setSnack({ msg: `Delete failed: ${String(detail)}`, type: 'error' });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View style={styles.header}><Text style={styles.headerText}>{username}'s Listings</Text></View>
      <FlatList
        data={products}
        keyExtractor={(p) => String(p.id)}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => doDelete(item.id)}
                style={styles.swipeDelete}
              >
                <Ionicons name="trash" size={22} color="#fff" />
                <Text style={styles.swipeDeleteText}>Delete</Text>
              </TouchableOpacity>
            )}
          >
            <View style={styles.row}>
              {item.image || item.image_url ? (
                <Image source={{ uri: (item.image || item.image_url) }} style={styles.thumb} />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.priceRow}>
                  <Text style={styles.price}>{formatPeso(Number(item.price))}</Text>
                  {item.created_at ? <Text style={styles.dot}> • </Text> : null}
                  {item.created_at ? (
                    <Text style={styles.time}>{relativeTimeFromNow(item.created_at)}</Text>
                  ) : null}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.msgBtn}
                onPress={() => navigation.navigate('Chat', { partnerId: userId, partnerName: username, productId: item.id })}
              >
                <Ionicons name="chatbubble" size={16} color="#fff" />
                <Text style={styles.msgText}>Message</Text>
              </TouchableOpacity>
            </View>
          </Swipeable>
        )}
      />
      <Snack visible={!!snack} message={snack?.msg || ''} type={(snack && snack.type) || 'success'} onHide={() => setSnack(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 12, backgroundColor: '#1877F2' },
  headerText: { color: '#fff', fontWeight: '600' },
  row: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff' },
  thumb: { width: 48, height: 48, borderRadius: 6, marginRight: 12, backgroundColor: '#f2f2f2' },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '600' },
  priceRow: { marginTop: 4 },
  price: { color: '#1877F2', fontWeight: '600' },
  dot: { color: '#888' },
  time: { color: '#888' },
  msgBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#1877F2', borderRadius: 6, marginLeft: 8 },
  msgText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  swipeDelete: { width: 96, backgroundColor: '#d93025', alignItems: 'center', justifyContent: 'center' },
  swipeDeleteText: { color: '#fff', fontWeight: '700', marginTop: 4 },
});
