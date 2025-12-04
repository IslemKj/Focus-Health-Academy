/**
 * QRScannerScreen
 * Admin QR code scanner for tickets
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../components';
import { coursesService, eventsService } from '../../api';
import theme from '../../theme';

const QRScannerScreen = ({ navigation }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async ({ data }) => {
    if (scanned || !scanning) return;
    
    setScanned(true);
    setScanning(false);
    setLoading(true);

    try {
      // Parse QR code data - it's a dictionary string like "{'enrollment_id': 'uuid', ...}"
      // Convert Python dict string to JSON-compatible format
      const jsonData = data
        .replace(/'/g, '"')  // Replace single quotes with double quotes
        .replace(/None/g, 'null')  // Replace Python None with null
        .replace(/True/g, 'true')  // Replace Python True with true
        .replace(/False/g, 'false');  // Replace Python False with false
      
      const parsed = JSON.parse(jsonData);
      let orderInfo = null;

      if (parsed.enrollment_id) {
        // Fetch enrollment details
        const response = await coursesService.getEnrollmentDetails(parsed.enrollment_id);
        orderInfo = {
          type: 'Course Enrollment',
          id: parsed.enrollment_id,
          studentName: response.student.first_name + ' ' + response.student.last_name,
          studentEmail: response.student.email,
          courseName: response.course.title,
          amount: `${response.amount_paid} ${response.currency}`,
          purchaseDate: new Date(response.enrolled_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          status: response.is_active ? 'Active' : 'Inactive',
          progress: response.progress_percentage,
          paymentReference: response.payment_reference || 'N/A',
        };
      } else if (parsed.registration_id) {
        // Fetch event registration details
        const response = await eventsService.getRegistrationDetails(parsed.registration_id);
        orderInfo = {
          type: 'Event Registration',
          id: parsed.registration_id,
          studentName: response.attendee.first_name + ' ' + response.attendee.last_name,
          studentEmail: response.attendee.email,
          eventName: response.event.title,
          eventDate: new Date(response.event.start_date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          registrationDate: new Date(response.registered_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }),
          status: response.is_cancelled ? 'Cancelled' : 'Confirmed',
          attended: response.attended ? 'Yes' : 'No',
        };
      } else {
        throw new Error('Invalid QR code format');
      }

      setOrderData(orderInfo);
      setModalVisible(true);
    } catch (error) {
      console.error('QR Scan Error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || error.message || 'Invalid QR code or order not found',
        [{ text: 'OK', onPress: () => handleCloseModal() }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setOrderData(null);
    setScanned(false);
    setScanning(true);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-off-outline" size={80} color="#9CA3AF" />
        <Text style={styles.permissionText}>No access to camera</Text>
        <Button
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Scan Ticket QR Code</Text>
            <View style={styles.closeButton} />
          </View>

          <View style={styles.scannerContainer}>
            <View style={styles.scannerFrame}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
            </View>
            
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Verifying ticket...</Text>
              </View>
            )}
          </View>

          <View style={styles.footer}>
            <Text style={styles.instructionText}>
              Position the QR code within the frame
            </Text>
          </View>
        </View>
      </CameraView>

      {/* Order Details Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Ionicons
                  name="checkmark-circle"
                  size={48}
                  color={theme.colors.success}
                />
              </View>
              <Text style={styles.modalTitle}>Valid Ticket</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={handleCloseModal}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {orderData && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Type</Text>
                    <Text style={styles.detailValue}>{orderData.type}</Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Student Name</Text>
                    <Text style={styles.detailValue}>{orderData.studentName}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValueSecondary}>
                      {orderData.studentEmail}
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  {orderData.type === 'Course Enrollment' ? (
                    <>
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Course</Text>
                        <Text style={styles.detailValue}>{orderData.courseName}</Text>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Amount Paid</Text>
                        <Text style={styles.detailValue}>{orderData.amount}</Text>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Purchase Date</Text>
                        <Text style={styles.detailValueSecondary}>
                          {orderData.purchaseDate}
                        </Text>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Progress</Text>
                        <Text style={styles.detailValue}>{orderData.progress}%</Text>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Status</Text>
                        <View
                          style={[
                            styles.statusBadge,
                            orderData.status === 'Active'
                              ? styles.statusActive
                              : styles.statusInactive,
                          ]}
                        >
                          <Text style={styles.statusText}>{orderData.status}</Text>
                        </View>
                      </View>

                      {orderData.paymentReference !== 'N/A' && (
                        <View style={styles.detailSection}>
                          <Text style={styles.detailLabel}>Payment Reference</Text>
                          <Text style={styles.detailValueSecondary}>
                            {orderData.paymentReference}
                          </Text>
                        </View>
                      )}
                    </>
                  ) : (
                    <>
                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Event</Text>
                        <Text style={styles.detailValue}>{orderData.eventName}</Text>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Event Date</Text>
                        <Text style={styles.detailValue}>{orderData.eventDate}</Text>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Registration Date</Text>
                        <Text style={styles.detailValueSecondary}>
                          {orderData.registrationDate}
                        </Text>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Status</Text>
                        <View
                          style={[
                            styles.statusBadge,
                            orderData.status === 'confirmed'
                              ? styles.statusActive
                              : styles.statusInactive,
                          ]}
                        >
                          <Text style={styles.statusText}>{orderData.status}</Text>
                        </View>
                      </View>

                      <View style={styles.detailSection}>
                        <Text style={styles.detailLabel}>Attended</Text>
                        <Text style={styles.detailValue}>{orderData.attended}</Text>
                      </View>
                    </>
                  )}

                  <View style={styles.divider} />

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Order ID</Text>
                    <Text style={styles.detailValueCode}>{orderData.id}</Text>
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                title="Scan Another"
                onPress={handleCloseModal}
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: '#fff',
  },
  scannerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  scannerFrame: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: '#fff',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
  loadingContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: '#fff',
    fontWeight: theme.typography.fontWeight.medium,
  },
  footer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: theme.typography.fontSize.base,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionText: {
    fontSize: theme.typography.fontSize.lg,
    color: '#6B7280',
    marginTop: theme.spacing.lg,
    textAlign: 'center',
  },
  backButton: {
    marginTop: theme.spacing.xl,
    minWidth: 150,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: theme.spacing.xl,
  },
  modalHeader: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalIconContainer: {
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  modalCloseButton: {
    position: 'absolute',
    top: theme.spacing.lg,
    right: theme.spacing.lg,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBody: {
    maxHeight: '70%',
    paddingHorizontal: theme.spacing.xl,
  },
  detailSection: {
    paddingVertical: theme.spacing.md,
  },
  detailLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
    textTransform: 'uppercase',
    fontWeight: theme.typography.fontWeight.semibold,
  },
  detailValue: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  detailValueSecondary: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  detailValueCode: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: theme.spacing.md,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  statusActive: {
    backgroundColor: '#D1FAE5',
  },
  statusInactive: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  modalFooter: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
});

export default QRScannerScreen;
