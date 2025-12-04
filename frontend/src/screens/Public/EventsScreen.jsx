/**
 * Modern EventsScreen
 * Responsive multilingual display of all available events with search and filters
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
import { EventCard } from '../../components';
import { eventsService, authService } from '../../api';
import { useTranslation } from '../../../hooks/useTranslation';
import theme from '../../theme';

const { width } = Dimensions.get('window');
const isTablet = width > 768;

// Translations
const translations = {
  en: {
    title: 'Events',
    subtitle: 'Discover upcoming healthcare events',
    search: 'Search events...',
    filter: 'Filter',
    sort: 'Sort',
    allTypes: 'All Types',
    upcoming: 'Upcoming',
    past: 'Past',
    today: 'Today',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    newest: 'Newest',
    oldest: 'Oldest',
    alphabetical: 'A-Z',
    byDate: 'By Date',
    noEvents: 'No events available',
    noResults: 'No events found',
    tryDifferentSearch: 'Try adjusting your filters or search term',
    loading: 'Loading events...',
    events: 'events',
    showing: 'Showing',
    clearFilters: 'Clear Filters',
    timePeriod: 'Time Period',
    eventType: 'Event Type',
    // Event types
    workshop: 'Workshop',
    seminar: 'Seminar',
    conference: 'Conference',
    webinar: 'Webinar',
    training: 'Training',
    all: 'All',
  },
  fr: {
    title: 'Événements',
    subtitle: 'Découvrez les événements de santé à venir',
    search: 'Rechercher des événements...',
    filter: 'Filtrer',
    sort: 'Trier',
    allTypes: 'Tous les Types',
    upcoming: 'À Venir',
    past: 'Passés',
    today: 'Aujourd\'hui',
    thisWeek: 'Cette Semaine',
    thisMonth: 'Ce Mois',
    newest: 'Plus Récents',
    oldest: 'Plus Anciens',
    alphabetical: 'A-Z',
    byDate: 'Par Date',
    noEvents: 'Aucun événement disponible',
    noResults: 'Aucun événement trouvé',
    tryDifferentSearch: 'Essayez d\'ajuster vos filtres ou votre recherche',
    loading: 'Chargement des événements...',
    events: 'événements',
    showing: 'Affichage de',
    clearFilters: 'Effacer les filtres',
    timePeriod: 'Période',
    eventType: 'Type d\'événement',
    // Event types
    workshop: 'Atelier',
    seminar: 'Séminaire',
    conference: 'Conférence',
    webinar: 'Webinaire',
    training: 'Formation',
    all: 'Tous',
  },
};

const EventsScreen = ({ navigation }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTime, setSelectedTime] = useState('upcoming');
  const [sortBy, setSortBy] = useState('byDate');
  const [currentUser, setCurrentUser] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const { t, language, setLanguage } = useTranslation(translations);

  const eventTypes = [
    { id: 'all', name: t('all'), icon: 'grid-outline' },
    { id: 'workshop', name: t('workshop'), icon: 'hammer-outline' },
    { id: 'seminar', name: t('seminar'), icon: 'school-outline' },
    { id: 'conference', name: t('conference'), icon: 'people-outline' },
    { id: 'webinar', name: t('webinar'), icon: 'desktop-outline' },
    { id: 'training', name: t('training'), icon: 'barbell-outline' },
  ];

  const timeFilters = [
    { id: 'upcoming', name: t('upcoming'), icon: 'calendar-outline' },
    { id: 'today', name: t('today'), icon: 'today-outline' },
    { id: 'thisWeek', name: t('thisWeek'), icon: 'calendar-number-outline' },
    { id: 'thisMonth', name: t('thisMonth'), icon: 'calendar-sharp' },
    { id: 'past', name: t('past'), icon: 'time-outline' },
  ];

  const sortOptions = [
    { id: 'byDate', name: t('byDate'), icon: 'calendar-outline' },
    { id: 'newest', name: t('newest'), icon: 'time-outline' },
    { id: 'alphabetical', name: t('alphabetical'), icon: 'text-outline' },
  ];

  const loadEvents = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await eventsService.getEvents();
      const eventsData = data.results || data;
      setEvents(eventsData);
      filterAndSortEvents(eventsData, searchQuery, selectedType, selectedTime, sortBy);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const isEventInTimeRange = (eventDate, timeFilter) => {
    const now = new Date();
    const event = new Date(eventDate);
    
    if (timeFilter === 'past') {
      return event < now;
    }
    
    if (timeFilter === 'upcoming') {
      return event >= now;
    }
    
    if (timeFilter === 'today') {
      return event.toDateString() === now.toDateString() && event >= now;
    }
    
    if (timeFilter === 'thisWeek') {
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return event >= now && event <= weekFromNow;
    }
    
    if (timeFilter === 'thisMonth') {
      return event.getMonth() === now.getMonth() && 
             event.getFullYear() === now.getFullYear() &&
             event >= now;
    }
    
    return true;
  };

  const filterAndSortEvents = (eventsData, search, type, time, sort) => {
    let filtered = [...eventsData];

    // Apply search filter
    if (search) {
      filtered = filtered.filter(event =>
        event.title?.toLowerCase().includes(search.toLowerCase()) ||
        event.description?.toLowerCase().includes(search.toLowerCase()) ||
        event.location?.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply type filter
    if (type !== 'all') {
      filtered = filtered.filter(event => 
        event.event_type?.toLowerCase() === type.toLowerCase()
      );
    }

    // Apply time filter
    filtered = filtered.filter(event => 
      isEventInTimeRange(event.start_date || event.date, time)
    );

    // Apply sorting
    if (sort === 'alphabetical') {
      filtered.sort((a, b) => a.title?.localeCompare(b.title));
    } else if (sort === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (sort === 'byDate') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.start_date || a.date);
        const dateB = new Date(b.start_date || b.date);
        return dateA - dateB;
      });
    }

    setFilteredEvents(filtered);
  };

  useEffect(() => {
    loadEvents();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    filterAndSortEvents(events, searchQuery, selectedType, selectedTime, sortBy);
  }, [searchQuery, selectedType, selectedTime, sortBy, events]);

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
      {/* Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.headerLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name="calendar" size={28} color="#FFFFFF" />
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

      {/* Time Filter Chips */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.quickFilters}
        contentContainerStyle={styles.quickFiltersContent}
      >
        {timeFilters.map((filter) => (
          <TouchableOpacity
            key={filter.id}
            style={[
              styles.quickFilterChip,
              selectedTime === filter.id && styles.quickFilterChipActive
            ]}
            onPress={() => setSelectedTime(filter.id)}
          >
            <Ionicons 
              name={filter.icon} 
              size={16} 
              color={selectedTime === filter.id ? '#FFFFFF' : '#6B7280'} 
            />
            <Text style={[
              styles.quickFilterText,
              selectedTime === filter.id && styles.quickFilterTextActive
            ]}>
              {filter.name}
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
            {t('filter')}
          </Text>
        </TouchableOpacity>

        <View style={styles.resultsCount}>
          <Text style={styles.resultsText}>
            {filteredEvents.length} {t('events')}
          </Text>
        </View>
      </View>

      {/* Filters Panel */}
      {showFilters && (
        <View style={styles.filtersPanel}>
          {/* Event Types */}
          <Text style={styles.filterLabel}>{t('eventType')}</Text>
          <View style={styles.typeGrid}>
            {eventTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  selectedType === type.id && styles.typeCardActive
                ]}
                onPress={() => setSelectedType(type.id)}
              >
                <Ionicons 
                  name={type.icon} 
                  size={20} 
                  color={selectedType === type.id ? '#2563EB' : '#6B7280'} 
                />
                <Text style={[
                  styles.typeCardText,
                  selectedType === type.id && styles.typeCardTextActive
                ]}>
                  {type.name}
                </Text>
                {selectedType === type.id && (
                  <View style={styles.typeCardCheck}>
                    <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort Options */}
          <Text style={styles.filterLabel}>{t('sort')}</Text>
          <View style={styles.sortOptions}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.sortOption,
                  sortBy === option.id && styles.sortOptionActive
                ]}
                onPress={() => setSortBy(option.id)}
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
        data={filteredEvents}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <EventCard
              event={item}
              onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
              style={styles.eventCard}
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
            onRefresh={() => loadEvents(true)}
            tintColor="#2563EB"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery || selectedType !== 'all' || selectedTime !== 'upcoming' 
                ? t('noResults') 
                : t('noEvents')}
            </Text>
            <Text style={styles.emptySubtitle}>{t('tryDifferentSearch')}</Text>
            {(searchQuery || selectedType !== 'all' || selectedTime !== 'upcoming') && (
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => {
                  setSearchQuery('');
                  setSelectedType('all');
                  setSelectedTime('upcoming');
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
          onPress={() => navigation.navigate('CreateEvent')}
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
  filtersPanel: {
    marginTop: 16,
    paddingHorizontal: 20,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  typeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  typeCardActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#2563EB',
  },
  typeCardText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  typeCardTextActive: {
    color: '#2563EB',
  },
  typeCardCheck: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
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
  eventCard: {
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

export default EventsScreen;