import React , {useState, useEffect} from 'react';
//import { View, Text, Button, TextInput, FlatList, SectionList, TouchableOpacity } from 'react-native';
import { View } from 'react-native';
import { List, Searchbar } from 'react-native-paper';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import axios from 'axios';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { set } from 'react-native-reanimated';
import {Platform, StyleSheet} from 'react-native';
//import { MapContainer, TileLayer, useMap, Marker as LeafletMarker, Popup, Polyline as LeafletPolyline } from 'react-leaflet'; // not showing properly on web, needs css load
//import /*MapView,*/ {Marker, UrlTile, Polyline, Circle } from 'react-native-maps';
//import { LatLng as LeafletLatLng, LeafletView } from 'react-native-leaflet-view'; // needs web view -> not compatible with web
//import MapView from '@teovilla/react-native-web-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gyroscope } from 'expo-sensors';
import { Accelerometer } from 'expo-sensors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { fetchLocation, setLocation } from '../../state/locationSlice';

// try to use mymap.web.js and mymap.js
//import MapView from '@teovilla/react-native-web-maps';

import MapView, {Marker, UrlTile, Polyline, Circle } from '../../components/mymap';

import { useLocationContext } from '../../components/LocationContext';

export default () => {
    const router = useRouter();
    
    const { from, to, setSelectedField, setSelectedLocation } = useLocationContext();
    const location = useSelector((state) => state.location.location);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    const getSearchResults = async (query) => {
        console.log("Query: " + query);
        try {
            if (query == '') {
                return;
            }
            const results = await axios.get(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=5`);

            console.log(results);
            //setSearchResults(results.data);
            //console.log(searchResults);
            if(location.coords.latitude != null && location.coords.longitude != null)
                setSearchResults([...results.data, { display_name: 'Your current position', lat: location.coords.latitude, lon: location.coords.longitude }]);
            else
                setSearchResults(results.data);
        }
        catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        //console.log("Search query: " + searchQuery);
        //getSearchResults(searchQuery);
        //setSearchResults([{ display_name: 'Your current position', lat: location.coords.latitude, lon: location.coords.longitude }]);
    }, []);

    return (
        <SafeAreaView style={{ padding: 20 }}>
            {/* Modify title bar */}
            <Stack.Screen options={{ title: 'Search location' }} />

            {/* Search users bar */}
            <Searchbar
                style={{ backgroundColor: 'white' }}
                placeholder="Search for locations"
                value={searchQuery}
                onChangeText={(query) => {
                    console.log(query);
                    setSearchQuery(query);
                    getSearchResults(query);
                }}

                // Trigger on finish typing
                onEndEditing={() => {
                    console.log("End editing");
                }}
            />

            {/* Display users in a list */}
            <View>
                {searchResults.map((loc, index) => (
                    <List.Item
                        title={loc.display_name}
                        //description={loc.display_name}
                        onPress={() => {
                            // navigate to user profile
                            setSelectedLocation(loc);
                            router.back();
                        }}
                        left={
                            props => <List.Icon {...props} icon={loc.icon} />
                        }
                    >
                        {loc}
                    </List.Item>
                ))}
            </View>
        </SafeAreaView>
    );
};