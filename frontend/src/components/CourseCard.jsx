/**
 * CourseCard component
 * Displays a course in a card format
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
  },
  fr: {
    free: 'Gratuit',
    online: 'En ligne',
    inPerson: 'En présentiel',
  },
};

const levelTranslations = {
  en: {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  },
  fr: {
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
  },
};

const CourseCard = ({ course, onPress, language = 'en' }) => {
  const t = (key) => translations[language]?.[key] || translations.en[key];
  
  const translateLevel = (level) => {
    if (!level) return '';
    const levelKey = level.toLowerCase();
    return levelTranslations[language]?.[levelKey] || level;
  };
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image
        source={{ uri: course.image || 'https://via.placeholder.com/300x200' }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {course.title}
        </Text>
        
        <Text style={styles.description} numberOfLines={2}>
          {course.short_description || course.description}
        </Text>
        
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Icon name="person" size={16} color={theme.colors.gray[600]} />
            <Text style={styles.metaText}>{course.teacher_name}</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Icon name="school" size={16} color={theme.colors.gray[600]} />
            <Text style={styles.metaText}>{translateLevel(course.level)}</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            {course.price > 0 ? (
              <Text style={styles.price}>€{course.price}</Text>
            ) : (
              <Text style={styles.priceFree}>{t('free')}</Text>
            )}
          </View>
          
          <View style={styles.badges}>
            {course.is_online && (
              <View style={[styles.badge, styles.badge_online]}>
                <Text style={styles.badgeText}>{t('online')}</Text>
              </View>
            )}
            {course.is_in_person && (
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
    height: 140,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  content: {
    padding: 12,
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

export default CourseCard;
