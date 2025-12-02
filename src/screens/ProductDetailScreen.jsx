import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, Alert, ScrollView, Modal, TextInput, TouchableOpacity } from 'react-native';
import { api } from '../api/client.js';
import { useAuth } from '../api/AuthContext.jsx';
import { Chip } from '../components/ui/Chip.jsx';
import { Button } from '../components/ui/Button.jsx';
import { formatPeso } from '../utils/format.js';

export default function ProductDetailScreen({ route, navigation }) {
  const { product: initialProduct } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState(initialProduct);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [qtyModalOpen, setQtyModalOpen] = useState(false);
  const [qtyInput, setQtyInput] = useState('1');
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      if (!initialProduct?.id) return;
      try {
        const { data } = await api.get(`/products/${initialProduct.id}/`);
        setProduct(data);
      } catch {}
    })();
  }, [initialProduct?.id]);

  const selectedVariant = useMemo(() => {
    if (!product?.variants || !selectedVariantId) return null;
    return product.variants.find((v) => v.id === selectedVariantId) || null;
  }, [product, selectedVariantId]);

  const productOutOfStock = useMemo(() => {
    if (product?.has_variants) return false;
    const s = Number(product?.stock || 0);
    return isNaN(s) || s <= 0;
  }, [product]);

  const addToCart = async (quantity) => {
    try {
      setLoading(true);
      const payload = { product_id: product.id, quantity };
      if (product?.has_variants) {
        if (!selectedVariantId) { Alert.alert('Please select a variant'); return; }
        if (selectedVariant && Number(selectedVariant.stock) <= 0) { Alert.alert('Out of stock', 'Selected variant is out of stock.'); return; }
        payload.variant_id = selectedVariantId;
      }
      if (!product?.has_variants && productOutOfStock) { Alert.alert('Out of stock', 'This item is out of stock.'); return; }
      await api.post('/cart/', payload);
      Alert.alert('Added to cart');
    } catch (e) {
      const data = e?.response?.data;
      const msg = (typeof data === 'string' && data) || data?.detail || data?.quantity || data?.variant_id || 'Cannot add to cart.';
      Alert.alert('Add to cart failed', String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleAddPress = () => {
    if (product?.has_variants) {
      if (!selectedVariantId) { Alert.alert('Please select a variant'); return; }
      if (selectedVariant && Number(selectedVariant.stock) <= 0) { Alert.alert('Out of stock', 'Selected variant is out of stock.'); return; }
    } else if (productOutOfStock) {
      Alert.alert('Out of stock', 'This item is out of stock.');
      return;
    }
    setQtyInput('1');
    setQtyModalOpen(true);
  };

  const confirmAdd = async () => {
    const q = parseInt(qtyInput, 10);
    if (!Number.isFinite(q) || q <= 0) {
      Alert.alert('Invalid quantity', 'Please enter a valid number greater than zero.');
      return;
    }
    if (product?.has_variants && selectedVariant) {
      const s = Number(selectedVariant.stock || 0);
      if (q > s) { Alert.alert('Not enough stock', `Available: ${s}`); return; }
    } else {
      const s = Number(product?.stock || 0);
      if (q > s) { Alert.alert('Not enough stock', `Available: ${s}`); return; }
    }
    setQtyModalOpen(false);
    await addToCart(q);
  };

  const startChat = () => {
    navigation.navigate('Chat', { partnerId: product.seller?.id, productId: product.id, partnerName: product.seller?.username });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {product?.image_url ? <Image source={{ uri: product.image_url }} style={styles.image} /> : <View style={[styles.image, styles.placeholder]} />}
      <Text style={styles.title}>{product?.title}</Text>
      <Text style={styles.price}>{formatPeso(Number(product?.price))}</Text>
      <Text style={styles.desc}>{product?.description}</Text>
      {product?.has_variants && Array.isArray(product?.variants) && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontWeight: '700', marginBottom: 8 }}>Select a variant</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {product.variants.map((v) => {
              const disabled = Number(v.stock) <= 0;
              const active = selectedVariantId === v.id;
              return (
                <Chip key={v.id} label={`${v.name} ${disabled ? '(Out of stock)' : `(${v.stock})`}`} active={!!active} disabled={!!disabled} onPress={() => !disabled && setSelectedVariantId(v.id)} />
              );
            })}
          </View>
        </View>
      )}
      <View style={{ height: 16 }} />
      {!product?.has_variants && productOutOfStock && (
        <Text style={styles.outOfStockText}>Out of stock</Text>
      )}
      <View style={styles.buttonRow}>
        <Button title="Add to Cart" onPress={handleAddPress} style={[styles.half, styles.mr8]} disabled={loading || (!product?.has_variants && productOutOfStock)} />
        <Button title="Message" variant="secondary" onPress={startChat} style={styles.half} />
      </View>

      <Modal visible={qtyModalOpen} transparent animationType="fade" onRequestClose={() => setQtyModalOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={{ fontWeight: '700', marginBottom: 8 }}>Enter quantity</Text>
            <TextInput
              value={qtyInput}
              onChangeText={setQtyInput}
              keyboardType="number-pad"
              style={styles.qtyInput}
              placeholder="1"
            />
            <View style={{ flexDirection: 'row' }}>
              <Button title="Cancel" onPress={() => setQtyModalOpen(false)} style={[styles.half, styles.mr8]} />
              <Button title="Add" onPress={confirmAdd} style={[styles.half]} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  image: { width: '100%', height: 240, borderRadius: 8, backgroundColor: '#f2f2f2' },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  title: { fontWeight: '700', fontSize: 20, marginTop: 12 },
  price: { color: '#1877F2', marginTop: 8, fontWeight: '600' },
  desc: { color: '#444', marginTop: 8 },
  buttonRow: { flexDirection: 'row' },
  half: { flex: 1 },
  mr8: { marginRight: 8 },
  outOfStockText: { color: '#c00', fontWeight: '700', marginBottom: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center' },
  modalCard: { width: '85%', backgroundColor: '#fff', borderRadius: 8, padding: 16 },
  qtyInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 12, marginBottom: 12 }
});
