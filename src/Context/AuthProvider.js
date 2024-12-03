import React, {createContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://trackway-eaaba2833129.herokuapp.com/api/auth/login',
        {email, password},
      );
      const {token, _id} = response.data;

      await AsyncStorage.setItem('userData', JSON.stringify({token, _id}));

      // Set user session
      setUser({token, _id});
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      await axios.post(
        'https://trackway-eaaba2833129.herokuapp.com/api/auth/signup',
        {
          name,
          email,
          password,
        },
      );
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userData');
    setUser(null);
  };

  // Check if the user is logged in by fetching data from AsyncStorage
  const checkAuth = async () => {
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      const {token, _id} = JSON.parse(userData);
      setUser({token, _id});
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{user, login, signup, logout, loading}}>
      {children}
    </AuthContext.Provider>
  );
};
