import React, { useContext } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { DataContext } from '../../context/DataContext';

/**
 * FeedScreen shows a consolidated list of feeding plans for all horses.  It
 * summarises what to feed and when so staff can quickly see each horse's
 * schedule.  Editing feed schedules can be done via the Horses tab.
 */
const FeedScreen = () => {
  const { horses } = useContext(DataContext);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Feeding Schedule</Text>
      <FlatList
        data={horses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text>{item.feedSchedule || 'No schedule set'}</Text>
          </View>
        )}
      />
      {horses.length === 0 && (
        <Text style={styles.placeholder}>No horses found.  Add horses to set feed schedules.</Text>
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

export default FeedScreen;