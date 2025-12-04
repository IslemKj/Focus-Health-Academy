import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { coursesService, eventsService } from '../../api';
import { useTranslation } from '../../../hooks/useTranslation';
import theme from '../../theme';

const translations = {
  en: {
    myTickets: 'My Tickets',
    noTickets: 'You have no tickets yet.',
    loading: 'Loading...'
  },
  fr: {
    myTickets: 'Mes Billets',
    noTickets: 'Vous n\'avez pas encore de billets.',
    loading: 'Chargement...'
  }
};

const TicketCard = ({ item, onPressView }) => {
  const title = item.type === 'course' ? item.course.title : item.event.title;
  const subtitle = item.type === 'course' ? 'Course' : 'Event';

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <Image
          source={{ uri: (item.type === 'course' ? item.course.image : item.event.image) || 'https://via.placeholder.com/120' }}
          style={styles.thumb}
        />
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardSubtitle}>{subtitle}</Text>
        <View style={styles.cardActions}>
          {item.qr_code ? (
            <TouchableOpacity style={styles.viewButton} onPress={() => onPressView(item.qr_code, title)}>
              <Ionicons name="qr-code-outline" size={18} color="#fff" />
              <Text style={styles.viewButtonText}>View Ticket</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.noQrText}>No ticket available</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const MyTicketsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const { t } = useTranslation(translations);

  useEffect(() => {
    loadTickets();
    const unsub = navigation.addListener('focus', () => loadTickets());
    return unsub;
  }, [navigation]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const [enrollRes, regRes] = await Promise.all([
        coursesService.getEnrollments(),
        eventsService.getRegistrations(),
      ]);

      const enrollments = (enrollRes && enrollRes.results) ? enrollRes.results : (Array.isArray(enrollRes) ? enrollRes : []);
      const registrations = (regRes && regRes.results) ? regRes.results : (Array.isArray(regRes) ? regRes : []);

      // Normalize items - only include in-person courses/events with QR codes
      const normalizedEnrollments = enrollments
        .filter(e => e.qr_code && e.course.is_in_person)
        .map(e => ({
          id: `course-${e.id}`,
          type: 'course',
          course: e.course,
          qr_code: e.qr_code,
          enrolled_at: e.enrolled_at,
        }));

      const normalizedRegistrations = registrations
        .filter(r => r.qr_code && r.event.is_in_person)
        .map(r => ({
          id: `event-${r.id}`,
          type: 'event',
          event: r.event,
          qr_code: r.qr_code,
          registered_at: r.registered_at,
        }));

      const combined = [...normalizedEnrollments, ...normalizedRegistrations];
      // sort by date desc
      combined.sort((a, b) => {
        const da = new Date(a.enrolled_at || a.registered_at || 0).getTime();
        const db = new Date(b.enrolled_at || b.registered_at || 0).getTime();
        return db - da;
      });

      setTickets(combined);
    } catch (error) {
      console.error('Error loading tickets', error);
      Alert.alert('Error', 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleViewQr = (qrBase64, title) => {
    if (!qrBase64) {
      Alert.alert('No Ticket', 'Ticket QR not available');
      return;
    }
    navigation.navigate('QRCodeViewer', { title, qrBase64 });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.header}>{t('myTickets')}</Text>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>{t('loading')}</Text>
        </View>
      ) : (
        <View>
          {tickets.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>{t('noTickets')}</Text>
            </View>
          ) : (
            tickets.map(item => (
              <TicketCard key={item.id} item={item} onPressView={handleViewQr} />
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  loadingWrap: { alignItems: 'center', padding: 24 },
  loadingText: { marginTop: 12, color: '#6B7280' },
  emptyWrap: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#6B7280' },
  card: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, marginBottom: 12, alignItems: 'center' },
  cardLeft: { marginRight: 12 },
  thumb: { width: 80, height: 60, borderRadius: 8 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: '#6B7280', marginBottom: 8 },
  cardActions: { flexDirection: 'row', alignItems: 'center' },
  viewButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  viewButtonText: { color: '#fff', marginLeft: 8, fontWeight: '600' },
  noQrText: { color: '#9CA3AF' },
});

export default MyTicketsScreen;
