import React, {useContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import TrackerScreen from './screens/Tracker';
import LoginScreen from './screens/Login';
import SignupScreen from './screens/SignUp';
import {AuthContext, AuthProvider} from './Context/AuthProvider';
import JourneysScreen from './screens/History';
import {View, Text, Image, StyleSheet, TouchableOpacity} from 'react-native';

import logo from './assets/logo.png';

const Drawer = createDrawerNavigator();

const AppNavigator = () => {
  const {user, logout} = useContext(AuthContext);

  return (
    <Drawer.Navigator
      drawerContent={props => (
        <View style={styles.drawerContent}>
          <View style={styles.logoContainer}>
            <Image source={logo} style={styles.logo} />
            <Text style={styles.appName}>TrackWay</Text>
          </View>

          <View style={styles.drawerItems}>
            {props.state.routes.map((route, index) => {
              const {name} = route;
              const {options} = props.descriptors[route.key];

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => props.navigation.navigate(name)}
                  style={styles.drawerItem}>
                  <Text style={styles.drawerItemText}>
                    {options.title || name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}>
      {user ? (
        <>
          <Drawer.Screen name="Tracker" component={TrackerScreen} />
          <Drawer.Screen name="Journeys" component={JourneysScreen} />
          <Drawer.Screen
            name="Logout"
            component={() => {
              logout();
              return null;
            }}
          />
        </>
      ) : (
        <>
          <Drawer.Screen name="Login" component={LoginScreen} />
          <Drawer.Screen name="Signup" component={SignupScreen} />
        </>
      )}
    </Drawer.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 5,
    marginRight: 10,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F4AD40',
  },
  drawerItems: {
    flex: 1,
  },
  drawerItem: {
    paddingVertical: 15,
  },
  drawerItemText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
});
