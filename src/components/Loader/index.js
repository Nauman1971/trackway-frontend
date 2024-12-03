import React from 'react';
import {View, StyleSheet, ActivityIndicator, Text} from 'react-native';

const Loading = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#778D45" />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent background
  },
  text: {
    marginTop: 10,
    fontSize: 18,
    color: '#fff', // Customize color as per your theme
  },
});

export default Loading;
