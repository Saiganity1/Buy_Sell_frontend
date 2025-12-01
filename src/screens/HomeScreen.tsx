import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, RefreshControl, TextInput, ScrollView } from 'react-native';
import { api } from '../api/client';
import { fetchCategories, Category } from '../api/categories';
import { Card } from '../components/ui/Card';
import { Chip } from '../components/ui/Chip';
import { Button } from '../components/ui/Button';
import { theme } from '../theme';
import { formatPeso } from '../utils/format';

interface Product {
  id: number;
  title: string;
  description: string;
  price: string;
  image_url?: string;
  image?: string;
  seller: { id: number; username: string };
}

export default function HomeScreen({ navigation }: any) {
  const [products, setProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [cats, setCats] = useState<Category[]>([]);
  const [category, setCategory] = useState<number | null>(null);

  const load = async () => {
    setRefreshing(true);
    try {
      const params: any = {};
      if (q) params.q = q;
      if (category) params.category = category;
      const { data } = await api.get('/products/', { params });
      setProducts(data);
    } catch (e: any) {
      console.warn('Failed to load products', e?.response?.status, e?.response?.data || e?.message);
    } finally {
      setRefreshing(false);
    }
  };

  const loadCats = async () => {
    try { setCats(await fetchCategories()); } catch {}
  };

  useEffect(() => { load(); loadCats(); }, []);

  const applySearch = () => load();

  const header = (
    <View style={{ padding: theme.spacing(2) }}>
      <View style={styles.searchRow}>
        <TextInput placeholder="Search products" value={q} onChangeText={setQ} style={styles.searchInput} onSubmitEditing={applySearch} />
        <Button title="Search" onPress={applySearch} style={{ paddingHorizontal: 16 }} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: theme.spacing(1) }}>
        <Chip label="All" active={!category} onPress={() => { setCategory(null); load(); }} />
        {cats.map(c => (
          <Chip key={c.id} label={c.name} active={category === c.id} onPress={() => { setCategory(c.id); load(); }} />
        ))}
      </ScrollView>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={header}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32, color: theme.colors.textMuted }}>No products yet. Try refreshing.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        contentContainerStyle={{ paddingHorizontal: theme.spacing(2) }}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: theme.spacing(2) }}>
            <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => navigation.navigate('ProductDetail', { product: item })}>
              {item.image || item.image_url ? (
                <Image source={{ uri: (item.image || item.image_url) as string }} style={styles.image} />
              ) : <View style={[styles.image, styles.placeholder]} />}
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.price}>{formatPeso(Number(item.price))}</Text>
                <Text style={styles.seller}>by {item.seller?.username}</Text>
              </View>
            </TouchableOpacity>
            <View style={{ marginTop: theme.spacing(1), alignSelf: 'flex-start' }}>
              <Button title="Message" variant="secondary" onPress={() => navigation.navigate('Chat', { partnerId: item.seller?.id, partnerName: item.seller?.username, productId: item.id })} />
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: { flexDirection: 'row' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.sm, padding: 10, marginRight: 8, backgroundColor: '#fff' },
  image: { width: 84, height: 84, borderRadius: theme.radius.sm, marginRight: 12, backgroundColor: '#f2f2f2' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '700', fontSize: 16, color: theme.colors.text },
  price: { color: theme.colors.primary, marginTop: 4, fontWeight: '600' },
  seller: { color: theme.colors.textMuted, marginTop: 4 },
});
