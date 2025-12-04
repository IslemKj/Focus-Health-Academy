/**
 * Modern CoursesScreen
 * Responsive multilingual display of all available courses with search and filters
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Dimensions,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CourseCard } from '../../components';
import { coursesService, authService } from '../../api';
import { useTranslation } from '../../../hooks/useTranslation';
import theme from '../../theme';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

// Translations
const translations = {
  en: {
    title: 'Discover Courses',
    subtitle: 'Explore our comprehensive catalog',
    search: 'Search courses...',
    filter: 'Filter',
    sort: 'Sort',
    allCategories: 'All Categories',
    newest: 'Newest',
    popular: 'Popular',
    alphabetical: 'A-Z',
    noCourses: 'No courses available',
    noResults: 'No courses found',
    tryDifferentSearch: 'Try adjusting your filters or search term',
    loading: 'Loading courses...',
    courses: 'courses',
    showing: 'Showing',
    clearFilters: 'Clear Filters',
    category: 'Category',
    // Categories
    healthScience: 'Health Science',
    nursing: 'Nursing',
    pharmacy: 'Pharmacy',
    medicine: 'Medicine',
    publicHealth: 'Public Health',
    all: 'All',
  },
  fr: {
    title: 'Découvrir les Cours',
    subtitle: 'Explorez notre catalogue complet',
    search: 'Rechercher des cours...',
    filter: 'Filtrer',
    sort: 'Trier',
    allCategories: 'Toutes les Catégories',
    newest: 'Plus Récents',
    popular: 'Populaires',
    alphabetical: 'A-Z',
    noCourses: 'Aucun cours disponible',
    noResults: 'Aucun cours trouvé',
    tryDifferentSearch: 'Essayez d\'ajuster vos filtres ou votre recherche',
    loading: 'Chargement des cours...',
    courses: 'cours',
    showing: 'Affichage de',
    clearFilters: 'Effacer les filtres',
    category: 'Catégorie',
    // Categories
    healthScience: 'Sciences de la Santé',
    nursing: 'Soins Infirmiers',
    pharmacy: 'Pharmacie',
    medicine: 'Médecine',
    publicHealth: 'Santé Publique',
    all: 'Tous',
  },
};

const CoursesScreen = ({ navigation }) => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const { t, language, setLanguage } = useTranslation(translations);

  const categories = [
    { id: 'all', name: t('all'), icon: 'grid-outline' },
    { id: 'healthScience', name: t('healthScience'), icon: 'fitness-outline' },
    { id: 'nursing', name: t('nursing'), icon: 'heart-outline' },
    { id: 'pharmacy', name: t('pharmacy'), icon: 'flask-outline' },
    { id: 'medicine', name: t('medicine'), icon: 'medical-outline' },
    { id: 'publicHealth', name: t('publicHealth'), icon: 'people-outline' },
  ];

  const sortOptions = [
    { id: 'newest', name: t('newest'), icon: 'time-outline' },
    { id: 'popular', name: t('popular'), icon: 'trending-up-outline' },
    { id: 'alphabetical', name: t('alphabetical'), icon: 'text-outline' },
  ];

  const loadCourses = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await coursesService.getCourses();
      const coursesData = data.results || data;
      setCourses(coursesData);
      filterAndSortCourses(coursesData, searchQuery, selectedCategory, sortBy);
    } catch (error) {
      console.error('Error loading courses:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAndSortCourses = (coursesData, search, category, sort) => {
    let filtered = [...coursesData];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(course =>
        course.title?.toLowerCase().includes(search.toLowerCase()) ||
        course.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter(course => 
        course.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply sorting
    if (sort === 'alphabetical') {
      filtered.sort((a, b) => a.title?.localeCompare(b.title));
    } else if (sort === 'popular') {
      filtered.sort((a, b) => (b.enrolled_count || 0) - (a.enrolled_count || 0));
    } else if (sort === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    setFilteredCourses(filtered);
  };

  useEffect(() => {
    loadCourses();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    filterAndSortCourses(courses, searchQuery, selectedCategory, sortBy);
  }, [searchQuery, selectedCategory, sortBy, courses]);

  const loadCurrentUser = async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        setCurrentUser(null);
        return;
      }
      const user = await authService.getProfile();
      setCurrentUser(user);
    } catch (error) {
      // Silently fail if not authenticated
      setCurrentUser(null);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'fr' : 'en');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Top Bar with Title and Language Toggle */}
      <View style={styles.topBar}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="school" size={28} color="#FFFFFF" />
          </View>
          <View style={styles.titleContent}>
            <Text style={styles.title}>{t('title')}</Text>
            <Text style={styles.subtitle}>{t('subtitle')}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.languageButton}
          onPress={toggleLanguage}
        >
          <Ionicons name="language" size={18} color="#6B7280" />
          <Text style={styles.languageText}>
            {language === 'en' ? 'EN' : 'FR'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('search')}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#9CA3AF"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            onPress={() => setSearchQuery('')}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </View>

      {/* Quick Filters Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.quickFilters}
        contentContainerStyle={styles.quickFiltersContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.quickFilterChip,
              selectedCategory === category.id && styles.quickFilterChipActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <Ionicons 
              name={category.icon} 
              size={16} 
              color={selectedCategory === category.id ? '#FFFFFF' : '#6B7280'} 
            />
            <Text style={[
              styles.quickFilterText,
              selectedCategory === category.id && styles.quickFilterTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={[styles.actionButton, showFilters && styles.actionButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons 
            name="options-outline" 
            size={18} 
            color={showFilters ? "#FFFFFF" : "#374151"} 
          />
          <Text style={[styles.actionButtonText, showFilters && styles.actionButtonTextActive]}>
            {t('sort')}
          </Text>
        </TouchableOpacity>

        <View style={styles.resultsCount}>
          <Text style={styles.resultsText}>
            {filteredCourses.length} {t('courses')}
          </Text>
        </View>
      </View>

      {/* Sort Panel */}
      {showFilters && (
        <View style={styles.sortPanel}>
          <Text style={styles.sortLabel}>{t('sort')}</Text>
          <View style={styles.sortOptions}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortOption,
                  sortBy === option.id && styles.sortOptionActive
                ]}
                onPress={() => {
                  setSortBy(option.id);
                  setShowFilters(false);
                }}
              >
                <View style={styles.sortOptionLeft}>
                  <Ionicons 
                    name={option.icon} 
                    size={20} 
                    color={sortBy === option.id ? '#2563EB' : '#6B7280'} 
                  />
                  <Text style={[
                    styles.sortOptionText,
                    sortBy === option.id && styles.sortOptionTextActive
                  ]}>
                    {option.name}
                  </Text>
                </View>
                {sortBy === option.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#2563EB" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredCourses}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <CourseCard
              course={item}
              onPress={() => navigation.navigate('CourseDetails', { courseId: item.id })}
              style={styles.courseCard}
              language={language}
            />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCourses(true)}
            tintColor="#2563EB"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="search-outline" size={64} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery || selectedCategory !== 'all' ? t('noResults') : t('noCourses')}
            </Text>
            <Text style={styles.emptySubtitle}>{t('tryDifferentSearch')}</Text>
            {(searchQuery || selectedCategory !== 'all') && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                <Ionicons name="refresh" size={18} color="#FFFFFF" />
                <Text style={styles.clearFiltersButtonText}>{t('clearFilters')}</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
      
      {currentUser?.role === 'admin' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('CreateCourse')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  list: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 24,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  titleContent: {
    flex: 1,
  },
  title: {
    fontSize: isTablet ? 32 : 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: isTablet ? 16 : 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  languageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
  },
  clearButton: {
    padding: 4,
  },
  quickFilters: {
    marginBottom: 20,
  },
  quickFiltersContent: {
    paddingHorizontal: 20,
    gap: 8,
  },
  quickFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickFilterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  quickFilterText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  quickFilterTextActive: {
    color: '#FFFFFF',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  actionButtonTextActive: {
    color: '#FFFFFF',
  },
  resultsCount: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
  },
  resultsText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  sortPanel: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  sortLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sortOptions: {
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortOptionActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#2563EB',
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortOptionText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  sortOptionTextActive: {
    color: '#2563EB',
    fontWeight: '600',
  },
  cardWrapper: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  courseCard: {
    marginBottom: 0,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    marginTop: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    maxWidth: 280,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#2563EB',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  clearFiltersButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});

export default CoursesScreen;