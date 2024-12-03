import React, {useEffect, useState, useRef, useContext} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {getDistance} from 'geolib';
import moment from 'moment';
import axios from 'axios';
import {AuthContext} from '../../Context/AuthProvider';

export function Map() {
  const {user, loading} = useContext(AuthContext);
  const [location, setLocation] = useState({latitude: null, longitude: null});
  const [journeyStarted, setJourneyStarted] = useState(false);
  const [journeyLine, setJourneyLine] = useState([]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [previousLocationForDistance, setPreviousLocationForDistance] =
    useState(null); // Use separate state for distance
  const [previousLocationForCamera, setPreviousLocationForCamera] =
    useState(null); // Separate state for camera animation
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const mapRef = useRef(null);

  // Get current location once when component mounts
  useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLocation({latitude, longitude});
      },
      error => {
        alert(error.message);
      },
      {enableHighAccuracy: true},
    );
  }, []);

  const startJourney = () => {
    setJourneyStarted(true);
    setJourneyLine([]);
    setTotalDistance(0);
    setPreviousLocationForDistance(location); // Set the initial location for distance calculation
    setStartTime(moment()); // Capture the start time when journey begins
  };

  const endJourney = async () => {
    setJourneyStarted(false);

    if (startTime) {
      // Ensure startTime is not null
      const endMoment = moment(); // Get current time as the end time
      setEndTime(endMoment); // Set the end time

      const timeDiff = moment.duration(endMoment.diff(startTime)); // Safely calculate duration
      const totalJourneyTime = `${timeDiff.hours()}:${timeDiff.minutes()}:${timeDiff.seconds()}`; // Format total time

      // ****************** api call*************
      const journeyData = {
        startLocation: previousLocationForDistance, // The location where the journey started
        endLocation: location, // The location where the journey ended
        distance: totalDistance, // Total distance traveled
        time: timeDiff.asSeconds(), // Total time in seconds
        user: user._id,
      };

      try {
        // Send the journey data to the backend API
        const response = await axios.post(
          'https://trackway-eaaba2833129.herokuapp.com/api/journey/save',
          journeyData,
          {
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
          },
        );
        console.log('Journey saved successfully:', response.data);
        // Show the alert with the calculated total time
        Alert.alert(
          'Journey Ended',
          `Total Distance: ${totalDistance.toFixed(
            2,
          )} meters. Total Time: ${totalJourneyTime}`,
        );
      } catch (error) {
        console.error('Error saving journey:', error);
        Alert.alert('Error', 'There was an issue saving the journey.');
      }
      // ****************** api call*************
    } else {
      console.error('startTime is not set properly.');
    }
  };

  // Track the user position and calculate distance (distance calculation logic)
  useEffect(() => {
    if (!journeyStarted) return;

    const watchId = Geolocation.watchPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLocation({latitude, longitude});

        // If this is the first time the user starts the journey, start the polyline right away
        if (!previousLocationForDistance) {
          // Add the first point to the polyline right away
          setJourneyLine([{latitude, longitude}]);
          setPreviousLocationForDistance({latitude, longitude});
        } else {
          // Calculate distance from previous location
          const distance = getDistance(previousLocationForDistance, {
            latitude,
            longitude,
          });

          // If the user has moved, add to the polyline and update the total distance
          setJourneyLine(prevLine => [...prevLine, {latitude, longitude}]);
          setTotalDistance(prevTotal => prevTotal + distance);

          // Update previous location
          setPreviousLocationForDistance({latitude, longitude});
        }
      },
      error => console.error(error),
      {
        distanceFilter: 0, // Track the position even for small movements (0 meters)
        interval: 5000, // Update every 5 seconds
      },
    );

    return () => Geolocation.clearWatch(watchId); // Clean up the watch when the component unmounts
  }, [journeyStarted, previousLocationForDistance]);

  // Camera animation logic (Separate logic for camera)
  useEffect(() => {
    if (
      journeyStarted &&
      mapRef.current &&
      location.latitude &&
      location.longitude
    ) {
      // Only animate the camera if the location has changed
      if (
        previousLocationForCamera &&
        (previousLocationForCamera.latitude !== location.latitude ||
          previousLocationForCamera.longitude !== location.longitude)
      ) {
        const camera = {
          center: {latitude: location.latitude, longitude: location.longitude},
          zoom: 17,
          pitch: 0,
          heading: 0,
          altitude: 1000,
        };

        mapRef.current.animateCamera(camera, {duration: 1000}); // Smooth animation
      }

      // Update previousLocationForCamera for camera logic (not for distance calculation)
      setPreviousLocationForCamera(location);
    }
  }, [journeyStarted, location, previousLocationForCamera]);

  console.log({user});

  return (
    <View style={styles.container}>
      {location.latitude && location.longitude ? (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider={
              Platform.OS === 'android' ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
            }
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={true}
            zoomEnabled={true}
            pitchEnabled={true}
            rotateEnabled={true}
            showsMyLocationButton={false}>
            {location.latitude && location.longitude && (
              <Marker coordinate={location} title="Current Location" />
            )}

            {journeyLine.length > 0 && (
              <Polyline
                coordinates={journeyLine}
                strokeColor="blue"
                strokeWidth={4}
              />
            )}
          </MapView>

          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.button}
              onPress={journeyStarted ? endJourney : startJourney}>
              <Text style={styles.buttonText}>
                {journeyStarted ? 'End Journey' : 'Start Journey'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.distanceText}>
              Total Distance: {totalDistance.toFixed(2)} meters
            </Text>

            {journeyStarted && startTime && (
              <Text style={styles.timeText}>
                Start Time: {startTime.format('HH:mm:ss')}
              </Text>
            )}

            {!journeyStarted && endTime && (
              <Text style={styles.timeText}>
                End Time: {endTime.format('HH:mm:ss')}
              </Text>
            )}

            {!journeyStarted && startTime && endTime && (
              <Text style={styles.timeText}>
                Total Time:{' '}
                {moment.duration(endTime.diff(startTime)).humanize()}
              </Text>
            )}
          </View>
        </>
      ) : (
        <Text>Loading location...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    left: '50%',
    transform: [{translateX: -140}],
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    maxWidth: 400,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  distanceText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  timeText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
});

export default Map;
