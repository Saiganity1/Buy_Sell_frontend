import React, { useEffect, useRef, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../api/client.js';
import { resolveImageUri } from '../utils/resolveImage.js';
import { useAuth } from '../api/AuthContext.jsx';
import { buildWsUrl } from '../api/ws.js';
import { formatPeso } from '../utils/format.js';
import { relativeTimeFromNow } from '../utils/time.js';
import { theme } from '../theme.js';

export default function ChatScreen({ route, navigation }) {
  const { partnerId, partnerName, productId } = route.params || {};
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [product, setProduct] = useState(null);
  const { access, user } = useAuth();
  const socketRef = useRef(null);
  const typingTimerRef = useRef(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const load = async () => {
    setChatLoading(true);
    const params = {};
    if (partnerId) params.partner_id = partnerId;
    if (productId) params.product_id = productId;
    const { data } = await api.get('/messages/', { params });
  try {
      // normalize and dedupe by id (normalize ids to string), sort by created_at asc
      const list = Array.isArray(data) ? data.slice() : [];
      const uniq = [];
      const seen = new Set();
      list.sort((a, b) => {
        const ta = a?.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b?.created_at ? new Date(b.created_at).getTime() : 0;
        return ta - tb;
      }).forEach((it) => {
        if (!it || it.id == null) return;
        const idStr = String(it.id);
        if (!seen.has(idStr)) {
          seen.add(idStr);
          uniq.push(it);
        }
      });
      setMsgs(uniq);
    } catch (e) {
      setMsgs(data);
    }
    setChatLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!productId) { setProduct(null); return; }
    (async () => {
      try {
        const { data } = await api.get(`/products/${productId}/`);
        setProduct(data);
      } catch {}
    })();
  }, [productId]);

  useEffect(() => {
    if (!access) return;
    if (!partnerId) return;
    const path = productId ? `/ws/chat/${partnerId}/${productId}/` : `/ws/chat/${partnerId}/`;
    const wsUrl = buildWsUrl(`${path}?token=${encodeURIComponent(access)}`);
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;
    ws.onmessage = (evt) => {
      try {
        const payload = JSON.parse(evt.data);
        if (payload?.event === 'typing') {
          if (payload.user_id === partnerId) {
            setPartnerTyping(!!payload.typing);
            if (payload.typing) {
              setTimeout(() => setPartnerTyping(false), 2000);
            }
          }
          return;
        }
        if (payload?.event === 'presence') {
          if (payload.user_id === partnerId) setPartnerOnline(!!payload.online);
          return;
        }
        // Add incoming message only if not already present (dedupe by id)
        if (payload && payload.id != null) {
          const payloadIdStr = String(payload.id);
          setMsgs((prev) => {
            if (prev.some((m) => m && String(m.id) === payloadIdStr)) return prev;
            const merged = [...prev, payload];
            merged.sort((a, b) => {
              const ta = a?.created_at ? new Date(a.created_at).getTime() : 0;
              const tb = b?.created_at ? new Date(b.created_at).getTime() : 0;
              return ta - tb;
            });
            return merged;
          });
        }
      } catch {}
    };
    ws.onerror = () => {};
    ws.onclose = () => { socketRef.current = null; };
    return () => { ws.close(); };
  }, [access, partnerId, productId]);

  const send = async () => {
    if (!text.trim()) return;
    if (socketRef.current && socketRef.current.readyState === 1) {
      socketRef.current.send(JSON.stringify({ content: text }));
      setText('');
    } else {
      if (!partnerId) return;
      try {
        const res = await api.post('/messages/', { recipient_id: partnerId, product: productId, content: text });
        const created = res.data;
        setText('');
        // Append created message if not present (server may also broadcast via websocket)
        if (created && created.id != null) {
          const createdIdStr = String(created.id);
          setMsgs((prev) => {
            if (prev.some((m) => m && String(m.id) === createdIdStr)) return prev;
            const merged = [...prev, created];
            merged.sort((a, b) => {
              const ta = a?.created_at ? new Date(a.created_at).getTime() : 0;
              const tb = b?.created_at ? new Date(b.created_at).getTime() : 0;
              return ta - tb;
            });
            return merged;
          });
        } else {
          // Fallback: reload list
          load();
        }
      } catch (err) {
        // On error, try to reload to show any persisted messages
        setText('');
        load();
      }
    }
  };

  const sendProduct = async () => {
    if (!partnerId || !productId) return;
    const title = product?.title || 'this item';
    const priceStr = product?.price != null ? formatPeso(Number(product.price)) : '';
    const summary = priceStr ? `${title} — ${priceStr}` : title;
    const content = `::product-share:: ${summary}`;
    if (socketRef.current && socketRef.current.readyState === 1) {
      socketRef.current.send(JSON.stringify({ content }));
    } else {
      await api.post('/messages/', { recipient_id: partnerId, product: productId, content });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.headerText}>Chat with {partnerName || 'Seller'}</Text>
          <View style={[styles.statusDot, { backgroundColor: partnerOnline ? '#2ecc71' : '#ccd1d9' }]} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {!!productId && (
            <TouchableOpacity style={[styles.headerBtn, { marginRight: 8 }]} onPress={sendProduct} accessibilityLabel="Send product info">
              <Ionicons name="pricetag" size={18} color="#fff" />
              <Text style={styles.headerBtnText}>Send product</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerBtn} onPress={load} accessibilityLabel="Refresh chat">
            {chatLoading ? <ActivityIndicator color="#fff" /> : <Ionicons name="refresh" size={18} color="#fff" />}
          </TouchableOpacity>
        </View>
      </View>
      {partnerTyping && (
        <View style={styles.typingRow}><Text style={styles.typingText}>{partnerName || 'User'} is typing…</Text></View>
      )}
      <FlatList
        style={{ flex: 1, backgroundColor: theme.colors.bg }}
        data={msgs}
        keyExtractor={(m) => String(m.id)}
        renderItem={({ item }) => {
          const mine = (item.sender?.id && user?.id && item.sender.id === user.id) || (item.sender?.username && user?.username && item.sender.username === user.username);
          const isProductShare = typeof item.content === 'string' && item.content.startsWith('::product-share::');
          const shownText = isProductShare ? item.content.replace('::product-share::', '').trim() : item.content;
          return (
            <View style={[styles.msgRow, mine ? styles.alignRight : styles.alignLeft]}>
              <View style={[mine ? styles.bubbleRight : styles.bubbleLeft]}>
                {isProductShare && product && (
                  <TouchableOpacity style={styles.prodCard} onPress={() => navigation.navigate('ProductDetail', { product })}>
                    {resolveImageUri(product) ? (
                      <Image source={{ uri: resolveImageUri(product) }} style={styles.prodThumb} />
                    ) : (
                      <View style={[styles.prodThumb, styles.prodThumbPh]} />
                    )}
                    <View style={{ flex: 1 }}>
                      <Text numberOfLines={1} style={styles.prodTitle}>{product.title}</Text>
                      <Text style={styles.prodPrice}>{formatPeso(Number(product.price))}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                {!!shownText && (
                  <Text style={[mine ? styles.bubbleTextRight : styles.bubbleTextLeft]}>{shownText}</Text>
                )}
                <Text style={[mine ? styles.timeRight : styles.timeLeft]}>{relativeTimeFromNow(item.created_at)}</Text>
              </View>
            </View>
          );
        }}
      />
      <View style={styles.inputRow}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={text}
            onChangeText={(t) => {
              setText(t);
              if (socketRef.current && socketRef.current.readyState === 1) {
                socketRef.current.send(JSON.stringify({ typing: !!t }));
              }
              if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
              typingTimerRef.current = setTimeout(() => {
                if (socketRef.current && socketRef.current.readyState === 1) {
                  socketRef.current.send(JSON.stringify({ typing: false }));
                }
              }, 1200);
            }}
          />
          {!!productId && (
            <TouchableOpacity style={styles.inlineIconBtn} onPress={sendProduct} accessibilityLabel="Send product">
              <Ionicons name="pricetag" size={18} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.sendFab} onPress={send} accessibilityLabel="Send message">
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { padding: 12, backgroundColor: '#1877F2', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerText: { color: '#fff', fontWeight: '600' },
  headerBtn: { flexDirection: 'row', alignItems: 'center' },
  headerBtnText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
  msgRow: { paddingHorizontal: 12, paddingVertical: 8 },
  alignLeft: { alignItems: 'flex-start' },
  alignRight: { alignItems: 'flex-end' },
  bubbleLeft: { maxWidth: '80%', backgroundColor: '#F2F2F7', borderRadius: 16, padding: 10, borderTopLeftRadius: 6 },
  bubbleRight: { maxWidth: '80%', backgroundColor: '#1877F2', borderRadius: 16, padding: 10, borderTopRightRadius: 6 },
  bubbleTextLeft: { color: '#111' },
  bubbleTextRight: { color: '#fff' },
  timeLeft: { color: '#777', fontSize: 10, marginTop: 4 },
  timeRight: { color: 'rgba(255,255,255,0.9)', fontSize: 10, marginTop: 4, textAlign: 'right' },
  prodCard: { flexDirection: 'row', alignItems: 'center', padding: 8, borderWidth: 1, borderColor: '#e8e8ef', borderRadius: 10, marginBottom: 6, backgroundColor: '#fff' },
  prodThumb: { width: 44, height: 44, borderRadius: 6, marginRight: 8, backgroundColor: '#f2f2f2' },
  prodThumbPh: { alignItems: 'center', justifyContent: 'center' },
  prodTitle: { fontWeight: '700' },
  prodPrice: { color: '#1877F2', fontWeight: '600', marginTop: 2 },
  typingRow: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff' },
  typingText: { color: '#777', fontStyle: 'italic', fontSize: 12 },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F6F7F9', borderRadius: 24, paddingHorizontal: 12, marginRight: 10, borderWidth: 1, borderColor: '#eee' },
  input: { flex: 1, paddingVertical: 10 },
  inlineIconBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  sendFab: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1877F2', alignItems: 'center', justifyContent: 'center' },
});
