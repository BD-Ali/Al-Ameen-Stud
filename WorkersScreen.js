import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { DataContext } from './DataContext';

/**
 * WorkersScreen lists the stable's employees and allows the administrator to
 * add new workers.
 */
const WorkersScreen = () => {
  const { workers, addWorker, removeWorker } = useContext(DataContext);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [contact, setContact] = useState('');

  const handleAddWorker = () => {
    if (!name) return;
    addWorker({ name, role, contact });
    setName('');
    setRole('');
    setContact('');
  };

  const handleRemoveWorker = (id, name) => {
    Alert.alert(
      'حذف العامل',
      `هل أنت متأكد أنك تريد حذف ${name}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const result = await removeWorker(id);
            if (result.success) {
              Alert.alert('نجح', 'تم حذف العامل بنجاح');
            } else {
              Alert.alert('خطأ', result.error || 'فشل حذف العامل');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={workers}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>👷 العمال</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{workers.length}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.workerName}>{item.name}</Text>
              <Text style={styles.workerEmoji}>👤</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>💼 الوظيفة:</Text>
              <Text style={styles.cardValue}>{item.role || 'غير محدد'}</Text>
            </View>
            <View style={styles.cardRow}>
              <Text style={styles.cardLabel}>📞 التواصل:</Text>
              <Text style={styles.cardValue}>{item.contact || 'غير متوفر'}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveWorker(item.id, item.name)}
            >
              <Text style={styles.removeButtonText}>حذف العامل</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>➕ إضافة عامل جديد</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>👤 الاسم</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="اسم العامل"
                placeholderTextColor="#64748b"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>💼 الوظيفة</Text>
              <TextInput
                value={role}
                onChangeText={setRole}
                placeholder="مثال: مدرب، سائس، مدير"
                placeholderTextColor="#64748b"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>📞 التواصل</Text>
              <TextInput
                value={contact}
                onChangeText={setContact}
                placeholder="هاتف أو بريد إلكتروني"
                placeholderTextColor="#64748b"
                style={styles.input}
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddWorker}>
              <Text style={styles.addButtonText}>إضافة عامل</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👷</Text>
            <Text style={styles.emptyText}>لا يوجد عمال بعد</Text>
            <Text style={styles.emptySubtext}>أضف أول عامل أدناه</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  contentContainer: {
    padding: 16,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  countBadge: {
    backgroundColor: '#ec4899',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  countText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ec4899',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  workerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  workerEmoji: {
    fontSize: 24,
  },
  cardRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: '#94a3b8',
    width: 100,
  },
  cardValue: {
    flex: 1,
    fontSize: 14,
    color: '#e2e8f0',
  },
  formSection: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e2e8f0',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#fff',
  },
  addButton: {
    backgroundColor: '#ec4899',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#ef4444',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#e2e8f0',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
});

export default WorkersScreen;
