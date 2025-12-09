import React, { useEffect, useRef, useState } from 'react';
import { SafeAreaView, View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../api/client.js';
import { resolveImageUri } from '../utils/resolveImage.js';
import { useAuth } from '../api/AuthContext.jsx';
import { buildWsUrl } from '../api/ws.js';
import { formatPeso } from '../utils/format.js';
import { relativeTimeFromNow } from '../utils/time.js';
import { useCurrentTheme } from '../hooks/useCurrentTheme.js';

export default function ChatScreen({ route, navigation }) {
  const { partnerId, partnerName, productId } = route.params || {};
  const theme = useCurrentTheme();
  const styles = getStyles(theme);
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [product, setProduct] = useState(null);
  const { access, user } = useAuth();
  const socketRef = useRef(null);
  const typingTimerRef = useRef(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  // Helper to compute a stable key for a message for deduplication.
  // Prefer database id when available; otherwise build a fingerprint from sender/recipient/product/content/created_at.
  const msgKey = (m) => {
    if (!m) return null;
    if (m.id != null) return `id:${String(m.id)}`;
    const senderId = m.sender?.id ?? m.sender?.username ?? '';
    // recipient may be id or object; fall back to partnerId if not present
    const recipientId = m.recipient?.id ?? m.recipient ?? '';
    const prod = (m.product && (m.product.id ?? m.product)) ?? productId ?? '';
    const content = typeof m.content === 'string' ? m.content.slice(0, 240) : JSON.stringify(m.content || '').slice(0, 240);
    const created = m.created_at ?? '';
    return `f:${senderId}|${recipientId}|${prod}|${content}|${created}`;
  };

  const load = async () => {
    setChatLoading(true);
    const params = {};
    if (partnerId) params.partner_id = partnerId;
    if (productId) params.product_id = productId;
    const { data } = await api.get('/messages/', { params });
  try {
      // normalize and dedupe by stable key, sort by created_at asc
      const list = Array.isArray(data) ? data.slice() : [];
      list.sort((a, b) => {
        const ta = a?.created_at ? new Date(a.created_at).getTime() : 0;
        const tb = b?.created_at ? new Date(b.created_at).getTime() : 0;
        return ta - tb;
      });
      const uniq = [];
      const seen = new Set();
      for (const it of list) {
        const k = msgKey(it);
        if (!k) continue;
        if (seen.has(k)) continue;
        seen.add(k);
        uniq.push(it);
      }
      setMsgs(uniq);
    } catch (e) {
      setMsgs(data);
    }
    setChatLoading(false);
  };

  // Initial load and refresh when screen gains focus
  useEffect(() => {
    load();
    const unsubscribe = navigation.addListener('focus', () => {
      load();
    });
    return () => { unsubscribe && unsubscribe(); };
  }, [navigation]);

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
        if (__DEV__) {
          try {
            console.log('[ChatScreen] ws.onmessage payload:', payload, 'msgKey=', msgKey(payload.message || payload));
          } catch (e) {}
        }
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
        // Add incoming message only if not already present (dedupe by stable key)
        if (payload) {
          // Some websocket payloads may wrap the message under `message` key
          const msg = payload.message || payload;
          const key = msgKey(msg);
          if (!key) return;
          setMsgs((prev) => {
            const seenKeys = new Set(prev.map((m) => msgKey(m)));
            if (seenKeys.has(key)) {
              if (__DEV__) console.log('[ChatScreen] duplicate incoming message ignored key=', key);
              return prev;
            }
            const merged = [...prev, msg];
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
          // Append created message using stable key to avoid duplicates
          if (created) {
            const k = msgKey(created);
            if (k) {
              setMsgs((prev) => {
                const seen = new Set(prev.map((m) => msgKey(m)));
                if (seen.has(k)) return prev;
                const merged = [...prev, created];
                merged.sort((a, b) => {
                  const ta = a?.created_at ? new Date(a.created_at).getTime() : 0;
                  const tb = b?.created_at ? new Date(b.created_at).getTime() : 0;
                  return ta - tb;
                });
                return merged;
              });
            } else {
              load();
            }
          } else {
            load();
          }
        } catch (err) {
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
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.headerText}>Chat with {partnerName || 'Seller'}</Text>
          <View style={[styles.statusDot, { backgroundColor: partnerOnline ? '#2ecc71' : theme.colors.inputBorder }]} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {!!productId && (
            <TouchableOpacity style={[styles.headerBtn, { marginRight: 8 }]} onPress={sendProduct} accessibilityLabel="Send product info">
              <Ionicons name="pricetag" size={18} color={theme.colors.cardBg === '#fff' ? '#fff' : theme.colors.text} />
              <Text style={styles.headerBtnText}>Send product</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.headerBtn} onPress={load} accessibilityLabel="Refresh chat">
            {chatLoading ? <ActivityIndicator color={theme.colors.cardBg === '#fff' ? '#fff' : theme.colors.text} /> : <Ionicons name="refresh" size={18} color={theme.colors.cardBg === '#fff' ? '#fff' : theme.colors.text} />}
          </TouchableOpacity>
        </View>
      </View>
      {partnerTyping && (
        <View style={styles.typingRow}><Text style={styles.typingText}>{partnerName || 'User'} is typing…</Text></View>
      )}
      <FlatList
        style={{ flex: 1, backgroundColor: theme.colors.bg }}
        data={msgs}
        keyExtractor={(m) => msgKey(m) || String(m.id || Math.random())}
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
    </SafeAreaView>
  );
}
const getStyles = (theme) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.bg },
    header: { padding: 12, backgroundColor: theme.colors.headerBg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
    headerText: { color: theme.colors.text, fontWeight: '600' },
    headerBtn: { flexDirection: 'row', alignItems: 'center' },
    headerBtnText: { color: theme.colors.text, marginLeft: 6, fontWeight: '600' },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginLeft: 8 },
    msgRow: { paddingHorizontal: 12, paddingVertical: 8 },
    alignLeft: { alignItems: 'flex-start' },
    alignRight: { alignItems: 'flex-end' },
    bubbleLeft: { maxWidth: '80%', backgroundColor: theme.colors.cardBg, borderRadius: 16, padding: 10, borderTopLeftRadius: 6, borderWidth: 1, borderColor: theme.colors.border },
    bubbleRight: { maxWidth: '80%', backgroundColor: theme.colors.primary, borderRadius: 16, padding: 10, borderTopRightRadius: 6 },
    bubbleTextLeft: { color: theme.colors.text },
    bubbleTextRight: { color: '#fff' },
    timeLeft: { color: theme.colors.textMuted, fontSize: 10, marginTop: 4 },
    timeRight: { color: 'rgba(255,255,255,0.9)', fontSize: 10, marginTop: 4, textAlign: 'right' },
    prodCard: { flexDirection: 'row', alignItems: 'center', padding: 8, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 10, marginBottom: 6, backgroundColor: theme.colors.cardBg },
    prodThumb: { width: 44, height: 44, borderRadius: 6, marginRight: 8, backgroundColor: theme.colors.border },
    prodThumbPh: { alignItems: 'center', justifyContent: 'center' },
    prodTitle: { fontWeight: '700', color: theme.colors.text },
    prodPrice: { color: theme.colors.primary, fontWeight: '600', marginTop: 2 },
    typingRow: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: theme.colors.cardBg },
    typingText: { color: theme.colors.textMuted, fontStyle: 'italic', fontSize: 12 },
    inputRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.cardBg },
    inputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.inputBg, borderRadius: 24, paddingHorizontal: 12, marginRight: 10, borderWidth: 1, borderColor: theme.colors.inputBorder },
    input: { flex: 1, paddingVertical: 10, color: theme.colors.text },
    inlineIconBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    sendFab: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' },
  });
