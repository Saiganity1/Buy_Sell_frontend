import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { api } from '../api/client.js';
import { theme } from '../theme.js';

export default function AdminUsersScreen({ navigation }) {
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
            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('AdminUserProducts', { userId: item.id, username: item.username })}>
              <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.username}</Text>
                <Text style={styles.sub} numberOfLines={1}>{[item.first_name, item.last_name].filter(Boolean).join(' ') || '—'}</Text>
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

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#fff' },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: theme.colors.primary, fontWeight: '700' },
  title: { fontWeight: '700', color: theme.colors.text },
  sub: { color: theme.colors.textMuted }
});
