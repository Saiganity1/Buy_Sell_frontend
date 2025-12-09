import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, Image, RefreshControl } from 'react-native';
import { api } from '../api/client.js';
import { useAuth } from '../api/AuthContext.jsx';
import { relativeTimeFromNow } from '../utils/time.js';

export default function MessagesScreen({ navigation }) {
  const { user, access } = useAuth();
  const [items, setItems] = useState([]);
  const [productMap, setProductMap] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/messages/');
      // Build conversation threads: one item per partner+product (latest message)
      const convMap = new Map();
      (Array.isArray(data) ? data : []).forEach((m) => {
        if (!m) return;
        const isMine = m.sender && user && (m.sender.id === user.id || m.sender.username === user.username);
        const partner = isMine ? (m.recipient && (m.recipient.id || m.recipient)) : (m.sender && (m.sender.id || m.sender));
        const partnerId = partner && (typeof partner === 'object' ? partner.id : partner) || null;
        const prod = m.product || '';
        const key = `${partnerId || 'anon'}|${prod}`;
        const existing = convMap.get(key);
        const curTime = m.created_at ? new Date(m.created_at).getTime() : 0;
        const existingTime = existing && existing.created_at ? new Date(existing.created_at).getTime() : 0;
        if (!existing || curTime >= existingTime) {
          // attach partner info in the stored message for navigation convenience
          const stored = { ...m, _partnerId: partnerId, _productId: prod };
          convMap.set(key, stored);
        }
      });
      const convs = Array.from(convMap.values()).sort((a, b) => {
        const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        return tb - ta; // newest first
      });
      setItems(convs);
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  // Initial load and reload whenever screen gains focus
  useEffect(() => {
    load();
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    return () => { unsubscribe && unsubscribe(); };
  }, [navigation]);

  // Poll for updates so the messages list refreshes when the other user replies.
  // This is a simple fallback when there's no global notification websocket.
  useEffect(() => {
    const iv = setInterval(() => {
      load();
    }, 4000);
    return () => clearInterval(iv);
  }, [user]);

  // Realtime notifications websocket (subscribe to per-user notifications)
  useEffect(() => {
    if (!access) return;
    let ws;
    try {
      const { buildWsUrl } = require('../api/ws.js');
      const url = buildWsUrl(`/ws/notifications/?token=${encodeURIComponent(access)}`);
      ws = new WebSocket(url);
      ws.onmessage = (ev) => {
        try {
          const payload = JSON.parse(ev.data);
          if (payload?.event === 'new_message') {
            load();
          }
        } catch (err) {}
      };
      ws.onclose = () => {};
    } catch (err) {}
    return () => { try { ws && ws.close(); } catch (_) {} };
  }, [access]);

  useEffect(() => {
    const ids = Array.from(new Set((items || []).map(m => m.product).filter(Boolean)));
    const missing = ids.filter(id => !productMap[id]);
    if (missing.length === 0) return;
    (async () => {
      try {
        const results = await Promise.all(missing.map(id => api.get(`/products/${id}/`).then(r => r.data).catch(() => null)));
        const updates = {};
        results.forEach(p => { if (p && p.id) updates[p.id] = p; });
        if (Object.keys(updates).length) setProductMap(prev => ({ ...prev, ...updates }));
      } catch {}
    })();
  }, [items]);

  const toConversation = (m) => {
    if (!user) return;
    const partnerId = m._partnerId || (m.sender && m.sender.id) || (m.recipient && m.recipient.id);
    const partnerName = (m.sender && m.sender.username) || (m.recipient && m.recipient && m.recipient.username) || '';
    navigation.navigate('Chat', { partnerId, partnerName, productId: m._productId || undefined });
  };

  const renderItem = ({ item }) => {
    const prod = item.product ? productMap[item.product] : null;
    const img = prod?.image || prod?.image_url;
    const partner = (item.sender && item.sender.id === user?.id) ? item.recipient : item.sender;
    const partnerName = partner && (partner.username || partner.id) || 'User';
    const rel = relativeTimeFromNow(item.created_at);
    const latestFromPartner = item.sender && user && (item.sender.id !== user.id && item.sender.username !== user.username);
    return (
      <TouchableOpacity style={styles.row} onPress={() => toConversation(item)}>
        {img ? (
          <Image source={{ uri: img }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumb, styles.thumbPlaceholder]} />
        )}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text numberOfLines={1} style={styles.title}>{partnerName}{prod?.title ? ` · ${prod.title}` : ''}</Text>
            <Text style={styles.time}>{rel}</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text numberOfLines={1} style={[styles.snippet, { flex: 1 }]}>{item.content}</Text>
            {latestFromPartner && (
              <View style={styles.badge} accessibilityLabel="Unread">
                <Text style={styles.badgeText}>•</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.brand}>MichaelPlace</Text>
        <Text style={styles.brandSub}>Messages</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>No messages yet.</Text></View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(m) => `${String(m._partnerId || m.sender?.id || '')}|${String(m._productId || m.product || '')}`}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
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

  row: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee', flexDirection: 'row', alignItems: 'center' },
  title: { fontWeight: '600', marginBottom: 6, maxWidth: '75%' },
  snippet: { color: '#666' },
  time: { color: '#999', marginLeft: 8, fontSize: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#666' },
  thumb: { width: 48, height: 48, borderRadius: 6, marginRight: 12, backgroundColor: '#f2f2f2' },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  badge: { marginLeft: 8, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: '#1877F2', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontWeight: '700', lineHeight: 16 },
});
