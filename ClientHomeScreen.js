import React, { useContext, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput } from 'react-native';
import { DataContext } from '../context/DataContext';

/**
 * ClientHomeScreen displays a client's upcoming and past lessons along with
 * their current payment status.  Since there is no authentication flow in
 * this demo, the user selects their client ID from a simple text field.
 */
const ClientHomeScreen = () => {
  const { clients, lessons, horses, workers } = useContext(DataContext);
  const [clientId, setClientId] = useState(clients.length > 0 ? clients[0].id : '');

  const selectedClient = clients.find((c) => c.id === clientId);
  const clientLessons = lessons.filter((l) => l.clientId === clientId);

  const getHorseName = (id) => horses.find((h) => h.id === id)?.name || id;
  const getWorkerName = (id) => workers.find((w) => w.id === id)?.name || id;

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Client Area</Text>
      <View style={styles.formRow}>
        <Text>Your Client ID</Text>
        <TextInput
          value={clientId}
          onChangeText={setClientId}
          placeholder={`Choose from: ${clients.map((c) => c.id + ':' + c.name).join(', ')}`}
          style={styles.input}
        />
      </View>
      {selectedClient ? (
        <View>
          <Text style={styles.subheading}>Welcome, {selectedClient.name}</Text>
          <Text>Amount Paid: ₪{selectedClient.amountPaid}</Text>
          <Text>Amount Due: ₪{selectedClient.amountDue}</Text>
          <Text style={styles.subheading}>Your Lessons</Text>
          <FlatList
            data={clientLessons}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.item}>
                <Text style={styles.itemTitle}>{item.date} {item.time}</Text>
                <Text>Horse: {getHorseName(item.horseId)}</Text>
                <Text>Instructor: {getWorkerName(item.instructorId)}</Text>
                <Text>Price: ₪{item.price}</Text>
              </View>
            )}
          />
          {clientLessons.length === 0 && (
            <Text style={styles.placeholder}>No lessons scheduled.</Text>
          )}
        </View>
      ) : (
        <Text style={styles.placeholder}>Client not found.</Text>
      )}
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
  placeholder: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },
});

export default ClientHomeScreen;