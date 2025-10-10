import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { DataContext } from './DataContext';

/**
 * ClientsScreen shows all clients and their payment status.
 */
const ClientsScreen = () => {
  const { clients, updateClient } = useContext(DataContext);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [paid, setPaid] = useState('');
  const [due, setDue] = useState('');

  const handleUpdate = () => {
    if (!selectedClientId) return;
    const paidNum = paid ? parseFloat(paid) : 0;
    const dueNum = due ? parseFloat(due) : 0;
    updateClient(selectedClientId, { amountPaid: paidNum, amountDue: dueNum });
    setSelectedClientId('');
    setPaid('');
    setDue('');
  };

  const UpdatePaymentForm = React.memo(() => (
    <View style={styles.formSection}>
      <Text style={styles.formTitle}>💰 Update Payment</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>👤 Client ID</Text>
        <TextInput
          value={selectedClientId}
          onChangeText={setSelectedClientId}
          placeholder={clients.length > 0 ? `e.g. ${clients[0].id}` : 'No clients yet'}
          placeholderTextColor="#64748b"
          style={styles.input}
        />
        {clients.length > 0 && (
          <Text style={styles.helpText}>
            Available: {clients.map((c) => `${c.id}:${c.name}`).join(', ')}
          </Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>💵 Amount Paid (₪)</Text>
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
        <Text style={styles.label}>📋 Amount Due (₪)</Text>
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
        <Text style={styles.addButtonText}>Update Payment</Text>
      </TouchableOpacity>
    </View>
  ));

  return (
    <View style={styles.container}>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.headerSection}>
            <Text style={styles.pageTitle}>👥 Clients</Text>
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
                <Text style={styles.paymentLabel}>Paid</Text>
                <Text style={styles.paidAmount}>₪{item.amountPaid || 0}</Text>
              </View>
              <View style={styles.paymentDivider} />
              <View style={styles.paymentItem}>
                <Text style={styles.paymentLabel}>Due</Text>
                <Text style={styles.dueAmount}>₪{item.amountDue || 0}</Text>
              </View>
            </View>
          </View>
        )}
        ListFooterComponent={<UpdatePaymentForm />}
        contentContainerStyle={styles.contentContainer}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyText}>No clients yet</Text>
            <Text style={styles.emptySubtext}>Clients are added when they sign up</Text>
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
  helpText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    fontStyle: 'italic',
  },
  addButton: {
    backgroundColor: '#06b6d4',
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

export default ClientsScreen;