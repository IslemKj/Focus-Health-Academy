/**
 * EventCard component
 * Displays an event in a card format
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '../theme';

const translations = {
  en: {
    free: 'Free',
    online: 'Online',
    inPerson: 'In-Person',
    featured: 'Featured',
  },
  fr: {
    free: 'Gratuit',
    online: 'En ligne',
    inPerson: 'En présentiel',
    featured: 'En vedette',
  },
};

const eventTypeTranslations = {
  en: {
    conference: 'Conference',
    workshop: 'Workshop',
    webinar: 'Webinar',
    seminar: 'Seminar',
  },
  fr: {
    conference: 'Conférence',
    workshop: 'Atelier',
    webinar: 'Webinaire',
    seminar: 'Séminaire',
  },
};

const EventCard = ({ event, onPress, language = 'en' }) => {
  const t = (key) => translations[language]?.[key] || translations.en[key];
  
  const translateEventType = (type) => {
    if (!type) return '';
    const typeKey = type.toLowerCase();
    return eventTypeTranslations[language]?.[typeKey] || type;
  };
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: event.image || 'https://via.placeholder.com/300x200' }}
        style={styles.image}
        resizeMode="cover"
      />
      
      {event.is_featured && (
        <View style={styles.featuredBadge}>
          <Icon name="star" size={16} color={theme.colors.white} />
          <Text style={styles.featuredText}>{t('featured')}</Text>
        </View>
      )}
      
      <View style={styles.content}>
        <Text style={styles.eventType}>{translateEventType(event.event_type).toUpperCase()}</Text>
        
        <Text style={styles.title} numberOfLines={2}>
          {event.title}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {event.short_description || event.description}
        </Text>
        
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Icon name="calendar-today" size={16} color={theme.colors.gray[600]} />
            <Text style={styles.metaText}>
              {formatDate(event.start_date)}
            </Text>
          </View>
          
          {event.is_in_person && event.city && (
            <View style={styles.metaItem}>
              <Icon name="place" size={16} color={theme.colors.gray[600]} />
              <Text style={styles.metaText}>{event.city}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            {event.price > 0 ? (
              <Text style={styles.price}>€{event.price}</Text>
            ) : (
              <Text style={styles.priceFree}>{t('free')}</Text>
            )}
          </View>
          
          <View style={styles.badges}>
            {event.is_online && (
              <View style={[styles.badge, styles.badge_online]}>
                <Text style={styles.badgeText}>{t('online')}</Text>
              </View>
            )}
            {event.is_in_person && (
              <View style={[styles.badge, styles.badge_inPerson]}>
                <Text style={styles.badgeText}>{t('inPerson')}</Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadow.md,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  featuredBadge: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  featuredText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    marginLeft: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.md,
  },
  eventType: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.accent,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  meta: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  metaText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginLeft: theme.spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  free: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success,
  },
  badges: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.xs,
  },
  badge_online: {
    backgroundColor: theme.colors.accent + '20',
  },
  badge_inPerson: {
    backgroundColor: theme.colors.secondary + '20',
  },
  badgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.primary,
  },
});

export default EventCard;
