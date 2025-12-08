import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, Platform, Switch, ActivityIndicator } from 'react-native';
import { api, getBaseUrl } from '../api/client.js';
import { useAuth } from '../api/AuthContext.jsx';
import * as ImagePicker from 'expo-image-picker';

export default function SellScreen() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [hasVariants, setHasVariants] = useState(false);
  const [stock, setStock] = useState('0');
  const [variants, setVariants] = useState([]);
  const { access } = useAuth();
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission required to access photos');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
    }
  };

  const onCreate = async () => {
    console.log('onCreate invoked', { title, price, imageUri, hasVariants, stock, variants });
    if (!title || !price) {
      Alert.alert('Title and price are required');
      return;
    }
    setLoading(true);
    Alert.alert('Posting', 'Posting item...');
    try {
      let data;
      
      if (imageUri) {
        const form = new FormData();
        form.append('title', title);
        form.append('price', String(price));
        form.append('description', description);
        form.append('has_variants', String(hasVariants));
        if (hasVariants) {
          form.append('variants', JSON.stringify(variants.map(v => ({ name: v.name, stock: Number(v.stock || 0) }))));
        } else {
          form.append('stock', String(Number(stock || 0)));
        }
        if (Platform.OS === 'web') {
          const res = await fetch(imageUri);
          const blob = await res.blob();
          const file = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
          form.append('image', file);
        } else {
          // On Android, ensure we send a valid name and mime type to avoid Network Error
          const name = (() => {
            try { const idx = imageUri.lastIndexOf('/'); return idx >= 0 ? imageUri.substring(idx + 1) : 'photo.jpg'; } catch { return 'photo.jpg'; }
          })();
          const lower = name.toLowerCase();
          const type = lower.endsWith('.png') ? 'image/png' : lower.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
          form.append('image', { uri: imageUri, name, type });
        }
        // On native (Android/iOS) use fetch for multipart to avoid axios FormData issues in Expo
        if (Platform.OS === 'web') {
          const opts = { headers: { 'Content-Type': 'multipart/form-data' } };
          const resp = await api.post('/products/', form, opts);
          data = resp.data;
        } else {
          try {
            const base = (getBaseUrl && typeof getBaseUrl === 'function') ? getBaseUrl() : api.defaults.baseURL;
            const url = `${base.replace(/\/$/, '')}/products/`;
            const token = access;
            const response = await fetch(url, {
              method: 'POST',
              body: form,
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            const text = await response.text();
            let parsed = null;
            try { parsed = JSON.parse(text); } catch { parsed = text; }
            if (!response.ok) throw { response: { status: response.status, data: parsed } };
            data = parsed;
          } catch (fe) {
            // Re-throw shape similar to axios error to be handled below
            throw fe;
          }
  }
  } else {
        const payload = { title, price, description, has_variants: hasVariants };
        if (hasVariants) {
          payload.variants = variants.map(v => ({ name: v.name, stock: Number(v.stock || 0) }));
        } else {
          payload.stock = Number(stock || 0);
        }
        const resp = await api.post('/products/', payload);
        data = resp.data;
      }
      Alert.alert('Posted', `Item #${data.id} created`);
      console.log('post success', data);
      setTitle(''); setPrice(''); setDescription(''); setImageUri(null);
      setHasVariants(false); setStock('0'); setVariants([]);
    } catch (e) {
      const status = e?.response?.status;
      const msg = e?.response?.data ? JSON.stringify(e.response.data) : (e?.message || 'Unknown error');
      // Common hint for Android Snack/Expo Go network errors
      if ((msg + '').includes('Network Error')) {
        console.warn('Network Error while posting. Verify API base URL and LAN reachability.');
      }
      console.warn('Create product failed', status, msg);
      Alert.alert('Failed to post', `Status: ${status ?? 'N/A'}\n${msg ?? 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sell an Item</Text>
      <TextInput style={styles.input} placeholder="Title" value={title} onChangeText={setTitle} />
      <TextInput style={styles.input} placeholder="Price" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
      <TextInput style={[styles.input, { height: 100 }]} placeholder="Description" value={description} onChangeText={setDescription} multiline />
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={{ width: '100%', height: 200, marginBottom: 10, borderRadius: 8 }} />
      ) : null}
      <TouchableOpacity style={[styles.button, { backgroundColor: '#34a853', marginBottom: 8 }]} onPress={pickImage}><Text style={styles.buttonText}>Pick Image</Text></TouchableOpacity>
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
              <TextInput style={[styles.input, { flex: 2, marginRight: 8 }]} placeholder="Variant name (e.g., Red / Large)" value={v.name} onChangeText={(t) => {
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
      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={onCreate} disabled={loading} accessibilityLabel="Post item">
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Post Item</Text>
        )}
      </TouchableOpacity>
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
  ,buttonDisabled: { opacity: 0.6 }
});
