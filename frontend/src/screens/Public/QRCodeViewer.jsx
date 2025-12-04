import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import theme from '../../theme';

const QRCodeViewer = ({ route }) => {
  const { title, qrBase64 } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {qrBase64 ? (
        <Image
          source={{ uri: `data:image/png;base64,${qrBase64}` }}
          style={styles.qr}
          resizeMode="contain"
        />
      ) : (
        <Text style={styles.noQr}>No QR code available</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20, color: theme.colors.primary },
  qr: { width: 300, height: 300, borderRadius: 8, backgroundColor: '#fff' },
  noQr: { color: '#6B7280' },
});

export default QRCodeViewer;
