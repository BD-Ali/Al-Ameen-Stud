import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { DataContext } from '../context/DataContext';

/**
 * VisitorHomeScreen is the public‑facing section of the app.  It shows a
 * friendly welcome message and lists the horses currently boarded at the
 * stable along with their breeds.  No sensitive information such as owner,
 * feeding schedule or value is shown.
 */
const VisitorHomeScreen = () => {
  const { horses } = useContext(DataContext);
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome to our Stable!</Text>
      <Text style={styles.paragraph}>We are proud to care for a variety of wonderful horses.  Feel free to look around and learn about them.</Text>
      <Text style={styles.subheading}>Our Horses</Text>
      <FlatList
        data={horses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text>Breed: {item.breed}</Text>
          </View>
        )}
      />
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
  paragraph: {
    fontSize: 16,
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
});

export default VisitorHomeScreen;