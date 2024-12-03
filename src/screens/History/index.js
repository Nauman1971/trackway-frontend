import React, {useState, useEffect, useContext} from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import {AuthContext} from '../../Context/AuthProvider';

const JourneysScreen = () => {
  const {user} = useContext(AuthContext);
  const [journeys, setJourneys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const loadJourneys = async (pageNum = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://trackway-eaaba2833129.herokuapp.com/api/journey/history?page=${pageNum}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );
      if (response.data.length < 10) {
        setHasMore(false); // If less than 10 journeys, assume no more data
      }
      setJourneys(prevJourneys =>
        pageNum === 1 ? response.data : [...prevJourneys, ...response.data],
      );
      setPage(pageNum + 1); // Increment page for next request
    } catch (error) {
      console.error('Error loading journeys:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    setHasMore(true);
    setJourneys([]);
    loadJourneys(1);
  };

  const loadMoreJourneys = () => {
    if (hasMore) {
      loadJourneys(page);
    }
  };

  const toggleAccordion = index => {
    setExpanded(expanded === index ? null : index);
  };

  useEffect(() => {
    loadJourneys();
    console.log('render');
  }, []);

  const renderItem = ({item, index}) => {
    const isExpanded = expanded === index;

    return (
      <View style={styles.journeyItem}>
        <TouchableOpacity onPress={() => toggleAccordion(index)}>
          <Text style={styles.journeyText}>
            Start Location: {item.startLocation.latitude},{' '}
            {item.startLocation.longitude}
          </Text>
          {isExpanded ? (
            <>
              <Text style={styles.journeyText}>
                End Location: {item.endLocation.latitude},{' '}
                {item.endLocation.longitude}
              </Text>
              <Text style={styles.journeyText}>
                Distance: {item.distanceTraveled} meters
              </Text>
              <Text style={styles.journeyText}>
                Time: {item.journeyTime} seconds
              </Text>
            </>
          ) : (
            <Text style={styles.journeyText}>Tap to see more details...</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <ActivityIndicator
          size="large"
          color="#0000ff"
          style={styles.loading}
        />
      ) : (
        <FlatList
          data={journeys}
          renderItem={renderItem}
          contentContainerStyle={{paddingBottom: 30}}
          keyExtractor={(item, index) => item._id || index.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListFooterComponent={() => {
            return (
              hasMore && (
                <Text style={styles.loadMoreText} onPress={loadMoreJourneys}>
                  Load More
                </Text>
              )
            );
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  loading: {
    marginTop: 20,
  },
  journeyItem: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  journeyText: {
    fontSize: 14,
    marginBottom: 5,
  },
  loadMoreText: {
    textAlign: 'center',
    marginVertical: 10,
    color: 'blue',
  },
  noMoreText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 16,
    color: 'gray',
  },
});

export default JourneysScreen;
