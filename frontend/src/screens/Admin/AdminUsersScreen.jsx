import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { usersService } from '../../api/users';
import { authService } from '../../api/auth';
import theme from '../../theme';

const AdminUsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadUsers();
    loadCurrentUser();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await usersService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const profile = await authService.getProfile();
      setCurrentUser(profile);
    } catch (err) {
      setCurrentUser(null);
    }
  };

  const openEdit = (user) => {
    setSelectedUser({ ...user });
    setModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      await usersService.updateUser(selectedUser.id, {
        first_name: selectedUser.first_name,
        last_name: selectedUser.last_name,
        email: selectedUser.email,
        role: selectedUser.role,
      });
      setModalVisible(false);
      setSelectedUser(null);
      await loadUsers();
      Alert.alert('Success', 'User updated');
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update user');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = (user) => {
    if (user.id === currentUser?.id) {
      Alert.alert('Error', 'You cannot delete your own account');
      return;
    }

    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${user.first_name} ${user.last_name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersService.deleteUser(user.id);
              await loadUsers();
              Alert.alert('Success', 'User deleted');
            } catch (error) {
              console.error('Error deleting user:', error);
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.userRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.first_name} {item.last_name}</Text>
        <Text style={styles.email}>{item.email}</Text>
        <Text style={styles.role}>Role: {item.role}</Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
      />

      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Edit User</Text>
          {selectedUser && (
            <>
              <TextInput
                style={styles.input}
                value={selectedUser.first_name}
                onChangeText={(v) => setSelectedUser({ ...selectedUser, first_name: v })}
                placeholder="First name"
              />
              <TextInput
                style={styles.input}
                value={selectedUser.last_name}
                onChangeText={(v) => setSelectedUser({ ...selectedUser, last_name: v })}
                placeholder="Last name"
              />
              <TextInput
                style={styles.input}
                value={selectedUser.email}
                onChangeText={(v) => setSelectedUser({ ...selectedUser, email: v })}
                placeholder="Email"
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                value={selectedUser.role}
                onChangeText={(v) => setSelectedUser({ ...selectedUser, role: v })}
                placeholder="Role (admin/staff/student)"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                  <Text style={styles.actionText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={updating}>
                  {updating ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionText}>Save</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  userRow: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, marginBottom: 12, borderRadius: 8 },
  name: { fontSize: 16, fontWeight: '600' },
  email: { color: '#6B7280' },
  role: { marginTop: 4, color: '#374151' },
  actions: { justifyContent: 'center', alignItems: 'flex-end' },
  editBtn: { backgroundColor: '#2563EB', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, marginBottom: 6 },
  deleteBtn: { backgroundColor: '#DC2626', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  actionText: { color: '#fff', fontWeight: '600' },
  modalContainer: { flex: 1, padding: 16, backgroundColor: '#fff' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 12, marginBottom: 12 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  cancelBtn: { backgroundColor: '#F3F4F6', padding: 12, borderRadius: 8 },
  saveBtn: { backgroundColor: '#2563EB', padding: 12, borderRadius: 8 },
});

export default AdminUsersScreen;
