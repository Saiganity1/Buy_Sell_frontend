import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Switch } from 'react-native';
import { api } from '../api/client';

export default function EditListingScreen({ route, navigation }: any) {
  const { productId } = route.params;
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [hasVariants, setHasVariants] = useState(false);
  const [stock, setStock] = useState('0');
  const [variants, setVariants] = useState<Array<{ id?: number; name: string; stock: string }>>([]);

  const load = async () => {
    const { data } = await api.get(`/products/${productId}/`);
    setTitle(data.title || '');
    setPrice(String(data.price || ''));
    setDescription(data.description || '');
    setHasVariants(!!data.has_variants);
    setStock(String(data.stock ?? '0'));
    const vs = Array.isArray(data.variants) ? data.variants.map((v: any) => ({ id: v.id, name: v.name, stock: String(v.stock) })) : [];
    setVariants(vs);
  };

  useEffect(() => { load(); }, [productId]);

  const save = async () => {
    try {
      setLoading(true);
      const payload: any = { title, description, price, has_variants: hasVariants };
      if (hasVariants) {
        payload.variants = variants.map(v => ({ name: v.name, stock: Number(v.stock || 0) }));
      } else {
        payload.stock = Number(stock || 0);
      }
      await api.put(`/products/${productId}/`, payload);
      Alert.alert('Saved');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Save failed', String(e?.response?.data?.detail || 'Please check your inputs.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Listing</Text>
      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Price" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
      <TextInput style={[styles.input, { height: 100 }]} placeholder="Description" value={description} onChangeText={setDescription} multiline />
      <View style={styles.rowBetween}>
        <Text style={{ fontWeight: '600' }}>Enable variants</Text>
        <Switch value={hasVariants} onValueChange={setHasVariants} />
      </View>
      {!hasVariants ? (
        <TextInput style={styles.input} placeholder="Stock (quantity)" keyboardType="number-pad" value={stock} onChangeText={setStock} />
      ) : (
        <View>
          {variants.map((v, idx) => (
            <View key={idx} style={styles.variantRow}>
              <TextInput style={[styles.input, { flex: 2, marginRight: 8 }]} placeholder="Variant name" value={v.name} onChangeText={(t) => {
                const copy = variants.slice(); copy[idx].name = t; setVariants(copy);
              }} />
              <TextInput style={[styles.input, { flex: 1, marginRight: 8 }]} placeholder="Stock" keyboardType="number-pad" value={v.stock} onChangeText={(t) => {
                const copy = variants.slice(); copy[idx].stock = t; setVariants(copy);
              }} />
              <TouchableOpacity onPress={() => setVariants(variants.filter((_, i) => i !== idx))}><Text style={{ color: 'red' }}>Remove</Text></TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity style={[styles.button, { backgroundColor: '#6c6cff', marginBottom: 8 }]} onPress={() => setVariants([...variants, { name: '', stock: '0' }])}><Text style={styles.buttonText}>Add Variant</Text></TouchableOpacity>
        </View>
      )}
      <TouchableOpacity style={styles.button} onPress={save} disabled={loading}><Text style={styles.buttonText}>Save</Text></TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 18, fontWeight: '600', marginBottom: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, marginBottom: 10 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  variantRow: { flexDirection: 'row', alignItems: 'center' },
  button: { backgroundColor: '#1877F2', padding: 12, borderRadius: 6, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' }
});
