/**
 * TimelineScreen
 * Social feed with posts
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PostCard, Button } from '../../components';
import { timelineService, authService } from '../../api';
import theme from '../../theme';
import { useTranslation } from '../../../hooks/useTranslation';

const translations = {
  en: {
    createPost: '+',
  },
  fr: {
    createPost: '+',
  },
};

const TimelineScreen = ({ navigation }) => {
  const { t, language, setLanguage } = useTranslation(translations);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const loadPosts = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await timelineService.getPosts();
      setPosts(data.results || data);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLike = async (postId) => {
    if (!currentUser) {
      Alert.alert(
        'Login Required',
        'Please login to like posts',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Login', onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    try {
      const post = posts.find((p) => p.id === postId);
      if (post.is_liked_by_user) {
        await timelineService.unlikePost(postId);
      } else {
        await timelineService.likePost(postId);
      }
      // Reload posts to update like status
      loadPosts(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };

  useEffect(() => {
    loadPosts();
    loadCurrentUser();
    
    // Reload user when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadCurrentUser();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadCurrentUser = async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        setCurrentUser(null);
        return;
      }
      // Fetch fresh profile data from API to ensure we have the latest role
      const user = await authService.getProfile();
      setCurrentUser(user);
      console.log('Current user loaded:', user);
    } catch (error) {
      // Silently fail if not authenticated
      setCurrentUser(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  return (
    <View style={styles.container}>
      {/* Language Toggle */}
      <TouchableOpacity 
        style={styles.languageToggle}
        onPress={toggleLanguage}
      >
        <Ionicons name="language" size={20} color="#2563EB" />
        <Text style={styles.languageText}>
          {language === 'en' ? 'EN' : 'FR'}
        </Text>
      </TouchableOpacity>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            onLike={() => handleLike(item.id)}
            onComment={() => navigation.navigate('PostDetails', { postId: item.id })}
          />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadPosts(true)}
          />
        }
      />

      {currentUser?.role === 'admin' && (
        <Button
          title={t('createPost')}
          onPress={() => navigation.navigate('CreatePost')}
          style={styles.fab}
          textStyle={styles.fabText}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  languageToggle: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
    gap: 6,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: theme.spacing.lg,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadow.lg,
  },
  fabText: {
    fontSize: theme.typography.fontSize['3xl'],
  },
});

export default TimelineScreen;
