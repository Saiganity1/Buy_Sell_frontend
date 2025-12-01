import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Image, Platform, Switch } from 'react-native';
import { api } from '../api/client';
import * as ImagePicker from 'expo-image-picker';

export default function SellScreen() {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [hasVariants, setHasVariants] = useState(false);
  const [stock, setStock] = useState('0');
  const [variants, setVariants] = useState<Array<{ name: string; stock: string }>>([]);

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
    if (!title || !price) return Alert.alert('Title and price are required');
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
        // In web, append a Blob/File instead of RN file descriptor
        const res = await fetch(imageUri);
        const blob = await res.blob();
        const file = new File([blob], 'photo.jpg', { type: blob.type || 'image/jpeg' });
        form.append('image', file);
      } else {
        // @ts-ignore RN FormData file
        form.append('image', { uri: imageUri, name: 'photo.jpg', type: 'image/jpeg' });
      }
      // Do not set Content-Type manually; let axios/native set the correct boundary
      const resp = await api.post('/products/', form);
      data = resp.data;
    } else {
      const payload: any = { title, price, description, has_variants: hasVariants };
      if (hasVariants) {
        payload.variants = variants.map(v => ({ name: v.name, stock: Number(v.stock || 0) }));
      } else {
        payload.stock = Number(stock || 0);
      }
      const resp = await api.post('/products/', payload);
      data = resp.data;
    }
    Alert.alert('Posted', `Item #${data.id} created`);
    setTitle(''); setPrice(''); setDescription(''); setImageUri(null);
    setHasVariants(false); setStock('0'); setVariants([]);
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
      <TouchableOpacity style={styles.button} onPress={onCreate}><Text style={styles.buttonText}>Post Item</Text></TouchableOpacity>
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
