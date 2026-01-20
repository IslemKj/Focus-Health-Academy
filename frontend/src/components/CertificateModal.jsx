import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';

const CertificateModal = ({ visible, onClose, certificateData }) => {
  const certificateRef = useRef();

  if (!certificateData) {
    return null;
  }

  const {
    certificate_id,
    student_name,
    course_title,
    completion_date,
    instructor_name,
    issued_date,
  } = certificateData;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      // If it's already formatted (e.g., "December 02, 2025"), return as-is
      if (typeof dateString === 'string' && dateString.includes(',')) {
        return dateString;
      }
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              @page { size: A4 landscape; margin: 0; }
              body {
                margin: 0;
                padding: 40px;
                font-family: 'Georgia', serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .certificate {
                background: white;
                padding: 60px;
                border: 20px solid #f0f0f0;
                box-shadow: 0 10px 50px rgba(0,0,0,0.3);
                text-align: center;
                max-width: 800px;
              }
              .certificate-header {
                border-bottom: 3px solid #667eea;
                padding-bottom: 20px;
                margin-bottom: 30px;
              }
              .certificate-title {
                font-size: 48px;
                color: #667eea;
                margin: 0;
                font-weight: bold;
              }
              .certificate-subtitle {
                font-size: 20px;
                color: #666;
                margin-top: 10px;
              }
              .student-name {
                font-size: 36px;
                color: #333;
                margin: 30px 0;
                font-weight: bold;
                text-transform: uppercase;
              }
              .course-title {
                font-size: 24px;
                color: #764ba2;
                margin: 20px 0;
                font-style: italic;
              }
              .details {
                margin-top: 40px;
                display: flex;
                justify-content: space-around;
                padding-top: 20px;
                border-top: 2px solid #eee;
              }
              .detail-item {
                text-align: center;
              }
              .detail-label {
                font-size: 12px;
                color: #999;
                text-transform: uppercase;
                letter-spacing: 1px;
              }
              .detail-value {
                font-size: 16px;
                color: #333;
                margin-top: 5px;
              }
              .certificate-id {
                font-size: 12px;
                color: #999;
                margin-top: 30px;
              }
            </style>
          </head>
          <body>
            <div class="certificate">
              <div class="certificate-header">
                <h1 class="certificate-title">Certificate of Completion</h1>
                <p class="certificate-subtitle">Focus Health Academy</p>
              </div>
              
              <p style="font-size: 18px; color: #666;">This certifies that</p>
              
              <div class="student-name">${student_name}</div>
              
              <p style="font-size: 18px; color: #666;">has successfully completed</p>
              
              <div class="course-title">${course_title}</div>
              
              <div class="details">
                <div class="detail-item">
                  <div class="detail-label">Completion Date</div>
                  <div class="detail-value">${formatDate(completion_date)}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Instructor</div>
                  <div class="detail-value">${instructor_name || 'Focus Health Academy'}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Issued Date</div>
                  <div class="detail-value">${formatDate(issued_date)}</div>
                </div>
              </div>
              
              <p class="certificate-id">Certificate ID: ${certificate_id}</p>
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Download Certificate',
        UTI: 'public.pdf',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate certificate PDF');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I've completed "${course_title}" at Focus Health Academy!\nCertificate ID: ${certificate_id}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  console.log('Rendering modal with data:', {
    student_name,
    course_title,
    certificate_id,
    completion_date,
    instructor_name,
    issued_date
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Your Certificate</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <View ref={certificateRef} style={styles.certificate}>
              {/* Certificate Header */}
              <View style={styles.certificateHeader}>
                <Text style={styles.certificateTitle}>Certificate of Completion</Text>
                <Text style={styles.certificateSubtitle}>Focus Health Academy</Text>
              </View>

              {/* Award Text */}
              <Text style={styles.awardText}>This certifies that</Text>

              {/* Student Name */}
              <Text style={styles.studentName}>{student_name}</Text>

              {/* Completion Text */}
              <Text style={styles.completionText}>has successfully completed</Text>

              {/* Course Title */}
              <Text style={styles.courseTitle}>{course_title}</Text>

              {/* Details Row */}
              <View style={styles.detailsContainer}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Completion Date</Text>
                  <Text style={styles.detailValue}>{formatDate(completion_date)}</Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Instructor</Text>
                  <Text style={styles.detailValue}>
                    {instructor_name || 'Focus Health Academy'}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Issued</Text>
                  <Text style={styles.detailValue}>{formatDate(issued_date)}</Text>
                </View>
              </View>

              {/* Certificate ID */}
              <Text style={styles.certificateId}>Certificate ID: {certificate_id}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.downloadButton]}
                onPress={handleDownloadPDF}
              >
                <MaterialIcons name="download" size={20} color="#fff" />
                <Text style={styles.buttonText}>Download PDF</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.shareButton]}
                onPress={handleShare}
              >
                <MaterialIcons name="share" size={20} color="#667eea" />
                <Text style={[styles.buttonText, { color: '#667eea' }]}>Share</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  scrollView: {
    flexGrow: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  certificate: {
    margin: 20,
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 8,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  certificateHeader: {
    borderBottomWidth: 2,
    borderBottomColor: '#667eea',
    paddingBottom: 15,
    marginBottom: 25,
    alignItems: 'center',
  },
  certificateTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
  },
  certificateSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  awardText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  studentName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 15,
    textTransform: 'uppercase',
  },
  completionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#764ba2',
    textAlign: 'center',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 20,
  },
  detailItem: {
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  certificateId: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 25,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 8,
  },
  downloadButton: {
    backgroundColor: '#667eea',
  },
  shareButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#667eea',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default CertificateModal;
