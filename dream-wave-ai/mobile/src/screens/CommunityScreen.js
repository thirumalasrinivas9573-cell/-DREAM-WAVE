import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getFeed, createPost, likePost, connectUser, getConnections } from '../api/api';
import { useAuth } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import GradientButton from '../components/GradientButton';
import { colors, gradients } from '../theme/colors';

function Avatar({ name, size = 36 }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.violetDim, borderWidth: 1, borderColor: colors.glassBorder, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.4 }}>{name?.[0]?.toUpperCase() || '?'}</Text>
    </View>
  );
}

export default function CommunityScreen({ navigation }) {
  const { user } = useAuth();
  const [tab, setTab]       = useState('feed');
  const [posts, setPosts]   = useState([]);
  const [conns, setConns]   = useState([]);
  const [postText, setPostText] = useState('');
  const [aaInput, setAaInput]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [msg, setMsg]           = useState('');

  useEffect(() => {
    getFeed().then(r => setPosts(r.data.posts || [])).catch(() => {});
    getConnections().then(r => setConns(r.data.connections || [])).catch(() => {});
  }, []);

  const post = async () => {
    if (!postText.trim()) return;
    try {
      const { data } = await createPost(postText);
      setPosts(p => [data.post, ...p]);
      setPostText('');
    } catch {}
  };

  const like = async (id) => {
    try {
      const { data } = await likePost(id);
      setPosts(p => p.map(x => x._id === id ? { ...x, likes: Array(data.likes).fill(null) } : x));
    } catch {}
  };

  const connect = async () => {
    if (!aaInput.trim()) return;
    setLoading(true); setMsg('');
    try {
      const { data } = await connectUser(aaInput.trim().toUpperCase());
      setMsg(`✅ Connected with ${data.friend?.name || aaInput}!`);
      setAaInput('');
      getConnections().then(r => setConns(r.data.connections || [])).catch(() => {});
    } catch (err) {
      setMsg(err.response?.data?.message || 'Connection failed');
    } finally { setLoading(false); }
  };

  return (
    <LinearGradient colors={gradients.bg} style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
        <Text style={styles.title}>👥 Community</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {['feed', 'connect'].map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'feed' ? '📰 Feed' : '🤝 Connect'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'feed' ? (
        <FlatList
          data={posts}
          keyExtractor={p => p._id}
          ListHeaderComponent={() => (
            <GlassCard style={styles.postBox}>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
                <Avatar name={user?.name} />
                <TextInput style={[styles.input, { flex: 1 }]} value={postText} onChangeText={setPostText}
                  placeholder="Share your progress..." placeholderTextColor={colors.white40}
                  multiline maxLength={500} />
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.white40, fontSize: 11 }}>{postText.length}/500</Text>
                <TouchableOpacity onPress={post} disabled={!postText.trim()} style={styles.postBtn}>
                  <LinearGradient colors={gradients.primary} style={styles.postBtnGrad}>
                    <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Post</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </GlassCard>
          )}
          renderItem={({ item }) => (
            <GlassCard style={styles.postCard}>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
                <Avatar name={item.userId?.name} />
                <View>
                  <Text style={styles.postName}>{item.userId?.name || 'User'}</Text>
                  <Text style={styles.postMeta}>{item.userId?.aaId} · {new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
              <Text style={styles.postContent}>{item.content}</Text>
              <TouchableOpacity onPress={() => like(item._id)} style={styles.likeBtn}>
                <Text style={styles.likeText}>❤️ {item.likes?.length || 0}  💬 {item.comments?.length || 0}</Text>
              </TouchableOpacity>
            </GlassCard>
          )}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
          ListEmptyComponent={<View style={styles.empty}><Text style={{ fontSize: 36 }}>📰</Text><Text style={styles.emptyText}>No posts yet. Be the first!</Text></View>}
        />
      ) : (
        <FlatList
          data={conns}
          keyExtractor={(_, i) => i.toString()}
          ListHeaderComponent={() => (
            <GlassCard style={{ margin: 16 }}>
              <Text style={styles.sectionLabel}>Connect by AA ID</Text>
              <TextInput style={styles.input} value={aaInput} onChangeText={setAaInput}
                placeholder="Enter AA ID (e.g. AA123456)" placeholderTextColor={colors.white40}
                autoCapitalize="characters" />
              <GradientButton title={loading ? '...' : 'Connect'} onPress={connect}
                disabled={loading || !aaInput.trim()} style={{ marginTop: 10 }} />
              {!!msg && <Text style={[styles.msg, { color: msg.startsWith('✅') ? colors.emerald : colors.red }]}>{msg}</Text>}
              <Text style={styles.aaIdText}>Your AA ID: <Text style={{ color: colors.violetLight, fontFamily: 'monospace' }}>{user?.aaId}</Text></Text>
            </GlassCard>
          )}
          renderItem={({ item }) => (
            <View style={styles.connRow}>
              <Avatar name={item?.name} />
              <View>
                <Text style={styles.connName}>{item?.name}</Text>
                <Text style={styles.connMeta}>{item?.aaId}{item?.goal ? ` · ${item.goal}` : ''}</Text>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12, gap: 12 },
  back:         { color: colors.white60, fontSize: 15 },
  title:        { fontSize: 18, fontWeight: '900', color: '#fff' },
  tabs:         { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: colors.white05, borderRadius: 12, padding: 4 },
  tab:          { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  tabActive:    { backgroundColor: colors.violet },
  tabText:      { color: colors.white40, fontWeight: '600', fontSize: 13 },
  tabTextActive:{ color: '#fff' },
  postBox:      { marginBottom: 4 },
  input:        { backgroundColor: colors.white05, borderWidth: 1, borderColor: colors.glassBorder, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: '#fff', fontSize: 13 },
  postBtn:      { borderRadius: 10, overflow: 'hidden' },
  postBtnGrad:  { paddingHorizontal: 16, paddingVertical: 8 },
  postCard:     {},
  postName:     { fontSize: 13, fontWeight: '700', color: '#fff' },
  postMeta:     { fontSize: 11, color: colors.white40 },
  postContent:  { fontSize: 13, color: colors.white80, lineHeight: 20, marginBottom: 8 },
  likeBtn:      {},
  likeText:     { fontSize: 12, color: colors.white40 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.white60, marginBottom: 10 },
  msg:          { fontSize: 13, marginTop: 8 },
  aaIdText:     { fontSize: 11, color: colors.white40, marginTop: 8 },
  connRow:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.white05 },
  connName:     { fontSize: 14, fontWeight: '600', color: '#fff' },
  connMeta:     { fontSize: 11, color: colors.white40 },
  empty:        { alignItems: 'center', paddingTop: 40, gap: 10 },
  emptyText:    { color: colors.white40, fontSize: 13 },
});
