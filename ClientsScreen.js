import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, Button } from 'react-native';
import { DataContext } from '../../context/DataContext';

/**
 * ClientsScreen shows all clients and their payment status.  Administrators
 * can update the amount a client has paid or the amount remaining.  Payments
 * are not processed here – this is just a ledger for lesson balances.
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

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Clients</Text>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text>Paid: ₪{item.amountPaid}</Text>
            <Text>Due: ₪{item.amountDue}</Text>
          </View>
        )}
      />
      <Text style={styles.subheading}>Update Payment</Text>
      <View style={styles.formRow}>
        <Text>Client ID</Text>
        <TextInput
          value={selectedClientId}
          onChangeText={setSelectedClientId}
          placeholder={`Choose from: ${clients.map((c) => c.id + ':' + c.name).join(', ')}`}
          style={styles.input}
        />
      </View>
      <View style={styles.formRow}>
        <Text>Amount Paid</Text>
        <TextInput
          value={paid}
          onChangeText={setPaid}
          placeholder="e.g. 100"
          keyboardType="numeric"
          style={styles.input}
        />
      </View>
      <View style={styles.formRow}>
        <Text>Amount Due</Text>
        <TextInput
          value={due}
          onChangeText={setDue}
          placeholder="e.g. 0"
          keyboardType="numeric"
          style={styles.input}
        />
      </View>
      <Button title="Update" onPress={handleUpdate} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subheading: {
    fontSize: 20,
    marginTop: 16,
    marginBottom: 8,
  },
  item: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginBottom: 8,
    borderRadius: 4,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  formRow: {
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
});

export default ClientsScreen;