import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

/**
 * LoginScreen presents three options: log in as an admin, log in as a client
 * or continue as a visitor.  For simplicity there is no authentication; the
 * buttons navigate directly to the corresponding sections of the app.
 */
const LoginScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to the Stable</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Admin Area"
          onPress={() => navigation.navigate('AdminTabs')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Client Area"
          onPress={() => navigation.navigate('ClientHome')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Visit Stable"
          onPress={() => navigation.navigate('VisitorHome')}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginVertical: 8,
    width: '80%',
  },
});

export default LoginScreen;