/**
 * OrdersScreen
 * View all paid orders/enrollments (Admin only)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { coursesService } from '../../api';
import theme from '../../theme';

const OrdersScreen = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await coursesService.getPaidOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error loading orders:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount, currency) => {
    return `${parseFloat(amount).toFixed(2)} ${currency}`;
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      {/* Header */}
      <View style={styles.orderHeader}>
        <View style={styles.orderHeaderLeft}>
          <Text style={styles.orderId} numberOfLines={1}>
            #{item.id.substring(0, 8)}
          </Text>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#10B981" />
            <Text style={styles.statusText}>Paid</Text>
          </View>
        </View>
        <Text style={styles.amount}>
          {formatAmount(item.amount_paid, item.currency)}
        </Text>
      </View>

      {/* Student Info */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color={theme.colors.gray[600]} />
          <Text style={styles.infoLabel}>Student:</Text>
          <Text style={styles.infoValue}>{item.student_name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={18} color={theme.colors.gray[600]} />
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{item.student_email}</Text>
        </View>
      </View>

      {/* Course Info */}
      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Ionicons name="book-outline" size={18} color={theme.colors.gray[600]} />
          <Text style={styles.infoLabel}>Course:</Text>
          <Text style={styles.infoValue} numberOfLines={2}>
            {item.course_title}
          </Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressPercentage}>{item.progress_percentage}%</Text>
        </View>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBar,
              { width: `${item.progress_percentage}%` },
            ]}
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.orderFooter}>
        <View style={styles.footerLeft}>
          <Ionicons name="time-outline" size={16} color={theme.colors.gray[500]} />
          <Text style={styles.dateText}>{formatDate(item.enrolled_at)}</Text>
        </View>
        {item.payment_reference && (
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Payment Reference',
                item.payment_reference,
                [{ text: 'OK' }]
              );
            }}
          >
            <Text style={styles.referenceLink}>Ref</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{orders.length}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {orders
              .reduce((sum, order) => sum + parseFloat(order.amount_paid || 0), 0)
              .toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Total Revenue (€)</Text>
        </View>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={theme.colors.gray[300]} />
            <Text style={styles.emptyText}>No paid orders yet</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadOrders(true)}
            colors={[theme.colors.primary]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.default,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.background.paper,
    padding: theme.spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    ...theme.shadow.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
  list: {
    padding: theme.spacing.md,
  },
  orderCard: {
    backgroundColor: theme.colors.background.paper,
    borderRadius: 12,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadow.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  orderHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray[700],
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  section: {
    marginBottom: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: theme.colors.gray[600],
    fontWeight: '500',
    minWidth: 60,
  },
  infoValue: {
    fontSize: 14,
    color: theme.colors.text.primary,
    flex: 1,
  },
  progressSection: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: theme.colors.gray[600],
    fontWeight: '500',
  },
  progressPercentage: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 3,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.gray[500],
  },
  referenceLink: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.gray[500],
    marginTop: theme.spacing.md,
  },
});

export default OrdersScreen;
