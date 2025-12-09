import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../api/client.js';
import { useCurrentTheme } from '../hooks/useCurrentTheme.js';

export default function AdminUsersScreen({ navigation }) {
  const theme = useCurrentTheme();
  const styles = getStyles(theme);
  const rs = rowStyles(theme);
  const [users, setUsers] = useState([]);

  const load = async () => {
    const { data } = await api.get('/admin/users/');
    setUsers(data);
  };

  useEffect(() => { load(); }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <FlatList
        data={users}
        keyExtractor={(u) => String(u.id)}
        contentContainerStyle={{ paddingVertical: 4 }}
        renderItem={({ item }) => {
          const initials = ((item.first_name && item.first_name[0]) || (item.username && item.username[0]) || '?').toUpperCase();
          return (
            <TouchableOpacity style={rs.row} onPress={() => navigation.navigate('AdminUserProducts', { userId: item.id, username: item.username })}>
              <View style={rs.avatar}><Text style={rs.avatarText}>{initials}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={rs.title}>{item.username}</Text>
                <Text style={rs.sub} numberOfLines={1}>{[item.first_name, item.last_name].filter(Boolean).join(' ') || '—'}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32, color: theme.colors.textMuted }}>No users</Text>}
      />
    </View>
  );
}
const getStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.bg },
});

const rowStyles = (theme) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.cardBg },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: theme.colors.primary, fontWeight: '700' },
  title: { fontWeight: '700', color: theme.colors.text },
  sub: { color: theme.colors.textMuted },
});
