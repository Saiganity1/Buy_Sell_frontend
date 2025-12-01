import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { api } from '../api/client';
import { useAuth } from '../api/AuthContext';
import { relativeTimeFromNow } from '../utils/time';

interface Message { id: number; content: string; created_at: string; sender: { id: number; username: string }; recipient: { id: number; username: string }; product?: number | null }

export default function MessagesScreen({ navigation }: any) {
  const { user } = useAuth();
  const [items, setItems] = useState<Message[]>([]);
  const [productMap, setProductMap] = useState<Record<number, any>>({});

  const load = async () => {
    try {
      const { data } = await api.get('/messages/');
      setItems(data);
    } catch {}
  };

  useEffect(() => { load(); }, []);

  // Prefetch any products referenced by messages (to display thumbnails)
  useEffect(() => {
    const ids = Array.from(new Set((items || []).map(m => m.product).filter(Boolean) as number[]));
    const missing = ids.filter(id => !productMap[id]);
    if (missing.length === 0) return;
    (async () => {
      try {
        const results = await Promise.all(missing.map(id => api.get(`/products/${id}/`).then(r => r.data).catch(() => null)));
        const updates: Record<number, any> = {};
        results.forEach(p => { if (p && p.id) updates[p.id] = p; });
        if (Object.keys(updates).length) setProductMap(prev => ({ ...prev, ...updates }));
      } catch {}
    })();
  }, [items]);

  const toConversation = (m: Message) => {
    if (!user) return;
    const isMine = m.sender.id === user.id || m.sender.username === user.username;
    const partner = isMine ? m.recipient : m.sender;
    navigation.navigate('Chat', { partnerId: partner.id, partnerName: partner.username, productId: m.product ?? undefined });
  };

  const renderItem = ({ item }: { item: Message }) => {
    const prod = item.product ? productMap[item.product] : null;
    const img = prod?.image || prod?.image_url;
    const partnerName = item.sender.id === user?.id ? item.recipient.username : item.sender.username;
    const rel = relativeTimeFromNow(item.created_at);
    return (
      <TouchableOpacity style={styles.row} onPress={() => toConversation(item)}>
        {img ? (
          <Image source={{ uri: img as string }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]} />
        )}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text numberOfLines={1} style={styles.title}>{partnerName}{prod?.title ? ` · ${prod.title}` : ''}</Text>
            <Text style={styles.time}>{rel}</Text>
          </View>
          <Text numberOfLines={1} style={styles.snippet}>{item.content}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {items.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>No messages yet.</Text></View>
      ) : (
        <FlatList data={items} keyExtractor={(m) => String(m.id)} renderItem={renderItem} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', alignItems: 'center' },
  title: { fontWeight: '600', marginBottom: 6, maxWidth: '75%' },
  snippet: { color: '#666' },
  time: { color: '#999', marginLeft: 8, fontSize: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#666' },
  thumb: { width: 48, height: 48, borderRadius: 6, marginRight: 12, backgroundColor: '#f2f2f2' },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
});
