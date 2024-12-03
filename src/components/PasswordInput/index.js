import React, {useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import EyeOpen from '../../assets/eye-open.svg';
import EyeClosed from '../../assets/eye-closed.svg';

const PasswordInput = ({password, setPassword}) => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#000"
        secureTextEntry={secureTextEntry}
      />
      <TouchableOpacity
        style={styles.iconContainer}
        onPress={() => setSecureTextEntry(!secureTextEntry)}>
        {secureTextEntry ? (
          <EyeClosed width={20} height={20} color="#333" />
        ) : (
          <EyeOpen width={20} height={20} color="#333" />
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 4 : 0,
    marginVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  iconContainer: {
    padding: 5,
  },
});

export default PasswordInput;
