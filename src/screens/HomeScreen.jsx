import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, Image, StyleSheet, RefreshControl, TextInput, ScrollView, Linking, Alert } from 'react-native';
import { api } from '../api/client.js';
import { fetchCategories } from '../api/categories.js';
import { Card } from '../components/ui/Card.jsx';
import { Chip } from '../components/ui/Chip.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useCurrentTheme } from '../hooks/useCurrentTheme.js';
import { formatPeso } from '../utils/format.js';
import { resolveImageUri } from '../utils/resolveImage.js';

export default function HomeScreen({ navigation }) {
  const theme = useCurrentTheme();
  const styles = getStyles(theme);
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [q, setQ] = useState('');
  const [cats, setCats] = useState([]);
  const [category, setCategory] = useState(null);

  const load = async () => {
    setRefreshing(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (category) params.category = category;
      const { data } = await api.get('/products/', { params });
      setProducts(data);
    } catch (e) {
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
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.brand}>MichaelPlace</Text>
        <Text style={styles.brandSub}>Buy & Sell</Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={header}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32, color: theme.colors.textMuted }}>No products yet. Try refreshing.</Text>}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: theme.spacing(2) }}>
            <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => navigation.navigate('ProductDetail', { product: item })}>
              {resolveImageUri(item) ? (
                <TouchableOpacity onPress={async () => {
                  const uri = resolveImageUri(item);
                  try {
                    const can = await Linking.canOpenURL(uri);
                    if (!can) return Alert.alert('Cannot open image URL');
                    Linking.openURL(uri);
                  } catch (e) { console.warn('Open image failed', e); }
                }}>
                  <Image source={{ uri: resolveImageUri(item) }} style={styles.image} />
                </TouchableOpacity>
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
    </SafeAreaView>
  );
}

const getStyles = (theme) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.colors.bg },
  header: {
    paddingVertical: 20,
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

  listContent: { paddingHorizontal: theme.spacing(2), paddingTop: theme.spacing(2), paddingBottom: theme.spacing(4) },

  searchRow: { flexDirection: 'row' },
  searchInput: { flex: 1, borderWidth: 1, borderColor: theme.colors.inputBorder, borderRadius: theme.radius.sm, padding: 10, marginRight: 8, backgroundColor: theme.colors.inputBg, color: theme.colors.text },
  image: { width: 84, height: 84, borderRadius: theme.radius.sm, marginRight: 12, backgroundColor: theme.colors.border },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '700', fontSize: 16, color: theme.colors.text },
  price: { color: theme.colors.primary, marginTop: 4, fontWeight: '600' },
  seller: { color: theme.colors.textMuted, marginTop: 4 },
});
