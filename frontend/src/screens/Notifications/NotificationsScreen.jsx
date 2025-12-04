/**
 * NotificationsScreen
 * Displays user notifications with mark as read and delete functionality
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { notificationsService } from '../../api';
import { useTranslation } from '../../../hooks/useTranslation';
import theme from '../../theme';

// Translations
const translations = {
  en: {
    title: 'Notifications',
    noNotifications: 'No notifications',
    noNotificationsDesc: 'You\'re all caught up!',
    markAllRead: 'Mark All Read',
    clearRead: 'Clear Read',
    deleteConfirm: 'Delete Notification',
    deleteMessage: 'Are you sure you want to delete this notification?',
    cancel: 'Cancel',
    delete: 'Delete',
    errorLoading: 'Error loading notifications',
    errorMarking: 'Error marking notification as read',
    errorDeleting: 'Error deleting notification',
    // Notification types
    course_enrollment: 'Course Enrollment',
    event_registration: 'Event Registration',
    payment_success: 'Payment Success',
    course_update: 'Course Update',
    event_update: 'Event Update',
    event_reminder: 'Event Reminder',
    post_like: 'New Like',
    post_comment: 'New Comment',
    comment_reply: 'New Reply',
    admin_announcement: 'Announcement',
    certificate_ready: 'Certificate Ready',
  },
  fr: {
    title: 'Notifications',
    noNotifications: 'Aucune notification',
    noNotificationsDesc: 'Vous êtes à jour !',
    markAllRead: 'Tout Marquer Lu',
    clearRead: 'Effacer Lus',
    deleteConfirm: 'Supprimer la Notification',
    deleteMessage: 'Êtes-vous sûr de vouloir supprimer cette notification ?',
    cancel: 'Annuler',
    delete: 'Supprimer',
    errorLoading: 'Erreur lors du chargement des notifications',
    errorMarking: 'Erreur lors du marquage de la notification',
    errorDeleting: 'Erreur lors de la suppression de la notification',
    // Notification types
    course_enrollment: 'Inscription au Cours',
    event_registration: 'Inscription à l\'Événement',
    payment_success: 'Paiement Réussi',
    course_update: 'Mise à Jour du Cours',
    event_update: 'Mise à Jour de l\'Événement',
    event_reminder: 'Rappel d\'Événement',
    post_like: 'Nouveau J\'aime',
    post_comment: 'Nouveau Commentaire',
    comment_reply: 'Nouvelle Réponse',
    admin_announcement: 'Annonce',
    certificate_ready: 'Certificat Prêt',
  },
};

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation(translations);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationsService.getNotifications();
      setNotifications(data.results || data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', t('errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await notificationsService.markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
        );
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate to linked content if available
    if (notification.link_type && notification.link_id) {
      switch (notification.link_type) {
        case 'course':
          navigation.navigate('CourseDetails', { courseId: notification.link_id });
          break;
        case 'event':
          navigation.navigate('EventDetails', { eventId: notification.link_id });
          break;
        case 'post':
          navigation.navigate('PostDetails', { postId: notification.link_id });
          break;
        default:
          break;
      }
    }
  };

  const handleDelete = (notificationId) => {
    Alert.alert(
      t('deleteConfirm'),
      t('deleteMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await notificationsService.deleteNotification(notificationId);
              setNotifications(prev => prev.filter(n => n.id !== notificationId));
            } catch (error) {
              console.error('Error deleting notification:', error);
              Alert.alert('Error', t('errorDeleting'));
            }
          },
        },
      ]
    );
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
      Alert.alert('Error', t('errorMarking'));
    }
  };

  const handleClearRead = async () => {
    try {
      await notificationsService.clearAllRead();
      setNotifications(prev => prev.filter(n => !n.is_read));
    } catch (error) {
      console.error('Error clearing read notifications:', error);
      Alert.alert('Error', t('errorDeleting'));
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      course_enrollment: 'school',
      event_registration: 'calendar',
      payment_success: 'checkmark-circle',
      course_update: 'refresh',
      event_update: 'refresh',
      event_reminder: 'alarm',
      post_like: 'heart',
      post_comment: 'chatbubble',
      comment_reply: 'chatbubbles',
      admin_announcement: 'megaphone',
      certificate_ready: 'ribbon',
    };
    return iconMap[type] || 'notifications';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      course_enrollment: '#10B981',
      event_registration: '#3B82F6',
      payment_success: '#22C55E',
      course_update: '#F59E0B',
      event_update: '#F59E0B',
      event_reminder: '#EF4444',
      post_like: '#EC4899',
      post_comment: '#8B5CF6',
      comment_reply: '#8B5CF6',
      admin_announcement: '#F59E0B',
      certificate_ready: '#10B981',
    };
    return colorMap[type] || '#6B7280';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.is_read && styles.unreadCard,
      ]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getNotificationColor(item.notification_type) + '15' },
        ]}
      >
        <Ionicons
          name={getNotificationIcon(item.notification_type)}
          size={24}
          color={getNotificationColor(item.notification_type)}
        />
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {!item.is_read && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>{formatDate(item.created_at)}</Text>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close-circle" size={22} color="#9CA3AF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('title')}</Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Action Buttons */}
      {notifications.length > 0 && (
        <View style={styles.actionsBar}>
          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleMarkAllRead}
            >
              <Ionicons name="checkmark-done" size={18} color="#2563EB" />
              <Text style={styles.actionButtonText}>{t('markAllRead')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleClearRead}
          >
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
            <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>
              {t('clearRead')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Notifications List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.emptyListContent,
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={80} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>{t('noNotifications')}</Text>
              <Text style={styles.emptyStateText}>{t('noNotificationsDesc')}</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
  listContent: {
    padding: 16,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#2563EB',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2563EB',
    marginLeft: 8,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default NotificationsScreen;
