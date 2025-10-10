import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { DataContext } from './DataContext';

/**
 * ClientsScreen shows all clients and their payment status.
 */
const ClientsScreen = () => {
  const { clients, updateClient, removeClient } = useContext(DataContext);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [paid, setPaid] = useState('');
  const [due, setDue] = useState('');
  const [showClientPicker, setShowClientPicker] = useState(false);

  const handleUpdate = async () => {
    if (!selectedClientId) {
      Alert.alert('خطأ', 'يرجى اختيار عميل');
      return;
    }

    const clientExists = clients.find(c => c.id === selectedClientId);
    if (!clientExists) {
      Alert.alert('خطأ', `العميل بالمعرف "${selectedClientId}" غير موجود.\n\nالعملاء المتاحون:\n${clients.map(c => `${c.id}: ${c.name}`).join('\n')}`);
      return;
    }

    const paidNum = paid ? parseFloat(paid) : 0;
    const dueNum = due ? parseFloat(due) : 0;

    const result = await updateClient(selectedClientId, { amountPaid: paidNum, amountDue: dueNum });

    if (result.success) {
      Alert.alert('نجح', `تم تحديث الدفع لـ ${clientExists.name}`);
      setSelectedClientId('');
      setPaid('');
      setDue('');
    } else {
      Alert.alert('خطأ', result.error || 'فشل تحديث الدفع');
    }
  };

  const handleRemoveClient = (id, name) => {
    Alert.alert(
      'حذف العميل',
      `هل أنت متأكد أنك تريد حذف ${name}؟`,
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            const result = await removeClient(id);
            if (result.success) {
              Alert.alert('نجح', 'تم حذف العميل بنجاح');
            } else {
              Alert.alert('خطأ', result.error || 'فشل حذف العميل');
            }
          }
        }
      ]
    );
  };

  const getSelectedClientName = () => {
    const client = clients.find(c => c.id === selectedClientId);
    return client ? client.name : 'اختر عميلاً';
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>👥 العملاء</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{clients.length}</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.clientName}>{item.name}</Text>
              <Text style={styles.clientEmoji}>👤</Text>
            </View>
            <View style={styles.paymentRow}>
              <View style={styles.paymentItem}>
                <Text style={styles.paymentLabel}>المدفوع</Text>
                <Text style={styles.paidAmount}>₪{item.amountPaid || 0}</Text>
              </View>
              <View style={styles.paymentDivider} />
              <View style={styles.paymentItem}>
                <Text style={styles.paymentLabel}>المستحق</Text>
                <Text style={styles.dueAmount}>₪{item.amountDue || 0}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveClient(item.id, item.name)}
            >
              <Text style={styles.removeButtonText}>حذف العميل</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>💰 تحديث الدفع</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>👤 اختر العميل</Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowClientPicker(!showClientPicker)}
              >
                <Text style={[styles.pickerButtonText, !selectedClientId && styles.placeholderText]}>
                  {getSelectedClientName()}
                </Text>
                <Text style={styles.dropdownArrow}>{showClientPicker ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showClientPicker && clients.length > 0 && (
                <ScrollView style={styles.pickerDropdown} nestedScrollEnabled={true}>
                  {clients.map((client) => (
                    <TouchableOpacity
                      key={client.id}
                      style={[
                        styles.pickerOption,
                        selectedClientId === client.id && styles.pickerOptionSelected
                      ]}
                      onPress={() => {
                        setSelectedClientId(client.id);
                        setShowClientPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        selectedClientId === client.id && styles.pickerOptionTextSelected
                      ]}>
                        {client.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}

              {clients.length === 0 && (
                <Text style={styles.helpText}>لا يوجد عملاء متاحون بعد</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>💵 المبلغ المدفوع (₪)</Text>
              <TextInput
                value={paid}
                onChangeText={setPaid}
                placeholder="100"
                keyboardType="numeric"
                placeholderTextColor="#64748b"
                style={styles.input}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>📋 المبلغ المستحق (₪)</Text>
              <TextInput
                value={due}
                onChangeText={setDue}
                placeholder="0"
                keyboardType="numeric"
                placeholderTextColor="#64748b"
                style={styles.input}
              />
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleUpdate}>
              <Text style={styles.addButtonText}>تحديث الدفع</Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyText}>لا يوجد عملاء بعد</Text>
            <Text style={styles.emptySubtext}>يتم إضافة العملاء عند التسجيل</Text>
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
    backgroundColor: '#06b6d4',
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
    borderLeftColor: '#06b6d4',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  clientName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  clientEmoji: {
    fontSize: 24,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentItem: {
    flex: 1,
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 8,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  paidAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10b981',
  },
  dueAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  paymentDivider: {
    width: 2,
    height: 40,
    backgroundColor: '#334155',
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
  pickerButton: {
    backgroundColor: '#0f172a',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#fff',
  },
  placeholderText: {
    color: '#64748b',
  },
  dropdownArrow: {
    color: '#64748b',
    fontSize: 12,
  },
  pickerDropdown: {
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: '#334155',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 200,
  },
  pickerOption: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  pickerOptionSelected: {
    backgroundColor: '#06b6d4',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#e2e8f0',
  },
  pickerOptionTextSelected: {
    color: '#fff',
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
  removeButton: {
    marginTop: 12,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ClientsScreen;