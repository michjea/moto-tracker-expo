import React , {useState, useEffect} from 'react';
import { View, Text, Button, TextInput, FlatList, SectionList, TouchableOpacity } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { set } from 'react-native-reanimated';
import {Platform, StyleSheet} from 'react-native';
//import { MapContainer, TileLayer, useMap, Marker as LeafletMarker, Popup, Polyline as LeafletPolyline } from 'react-leaflet'; // not showing properly on web, needs css load
import MapView, { Marker, UrlTile, Polyline, LatLng } from 'react-native-maps';
//import { LatLng as LeafletLatLng, LeafletView } from 'react-native-leaflet-view'; // needs web view -> not compatible with web
import { MapView as WebMapView } from '@teovilla/react-native-web-maps';

/*const DEFAULT_COORDINATE = {
    lat: 37.78825,
    lng: -122.4324,
  };  */

const Item = ({item, onPress}) => (
    <TouchableOpacity onPress={onPress} style={{backgroundColor:'white'}}>
      <Text>{item.display_name}</Text>
    </TouchableOpacity>
  );

const Map = () => {
    // Router
    const router = useRouter();

    const [position, setPosition] = useState([51.505, -0.09]);

    // Location
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [region, setRegion] = useState({
        latitude: 50.5,
        longitude: 30.5,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    // Search
    const [showSearchView, setShowSearchView] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [searchResults, setSearchResults] = useState([]);

    // Route view
    const [showRouteView, setShowRouteView] = useState(false);
    const [isFromSelection, setIsFromSelection] = useState(false); // true = from, false = to
    const [from, setFrom] = useState(null);
    const [to, setTo] = useState(null);

    // Circuit view
    const [showCircuitView, setShowCircuitView] = useState(false);

    // Route
    const [route, setRoute] = useState({});

    const askPermissions = async () => {
        const permissionF = await Location.getForegroundPermissionsAsync();
        const permissionB = await Location.getBackgroundPermissionsAsync();

        if (permissionF.status !== 'granted' || permissionB.status !== 'granted') {
            console.log("requesting permissions");

            let { statusF } = await Location.requestForegroundPermissionsAsync();
            let { statusB } = await Location.requestBackgroundPermissionsAsync();

            if (statusF !== 'granted' || statusB !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                console.error(errorMsg);
                return false;
            }
        }

        return true;
    };

    useEffect(() => {
        (async () => {
            // Check permissions and ask if not granted
            
            if (!await askPermissions()) return;

            // if not web, start location updates
            if (Platform.OS !== 'web') {
                await Location.startLocationUpdatesAsync('location', {
                    accuracy: Location.Accuracy.BestForNavigation,
                    distanceInterval: 1,
                });
            }

            await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.BestForNavigation,
                    distanceInterval: 1,
                },
                (location) => {

                    console.log("location callback : ", location);
                    setLocation(location);

                    console.log(location.coords.latitude, location.coords.longitude);

                    /*setRegion({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    });*/
                }
            );

        })();
    }, []);

    const handleCenterPress = async () => {
        if (!await askPermissions()) return;

        console.log("centering map");

        setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        });
    };

    const handleNewRoutePress = () => {
        setShowRouteView(true);
    };

    const handleNewCircuitPress = () => {
        setShowCircuitView(true);
    };

    const handleSearchChange = async () => {
        // call nominatim api to get location
        console.log("searching : ", searchText);
        const results = await axios.get(`https://nominatim.openstreetmap.org/search?q=${searchText}&format=json&addressdetails=1&limit=5`);
        console.log(results.data);
        setSearchResults(results.data);
        // add local position to results
        setSearchResults([...results.data, { display_name: 'Your current position', lat: location.coords.latitude, lon: location.coords.longitude }]);
    }

    const selectLocation = (location) => {
        console.log("selected location : ", location);
        setSelectedLocation(location);


        if (isFromSelection) {
            console.log("setting from");
            setFrom(location);
        } else {
            console.log("setting to");
            setTo(location);
        }

        console.log("setting selected location to null");
        setIsFromSelection(false);
        console.log("setting show search view to false");
        setShowSearchView(false);
    }

    const setPolygone = (polygone) => {
        console.log("setting polygone : ", polygone);
        // transform polygone to latlng array
        /*const coordinates = polygone.map((point) => {
            return { latitude: point[0], longitude: point[1] };
        });*/

        const coordinates = polygone.map((point) => {
            return { latitude: point["latitude"], longitude: point["longitude"] };
        });

        /*console.log("my polygone : ", polygone);
        // add each point to the array
        polygone.coordinates.map((point) => {
            coordinates.push({ latitude: point[1], longitude: point[0] });
        });*/

        console.log("my coords : ", coordinates);
        setRoute({ coordinates: coordinates });
    };



    return (
        <View style={{ flex: 1 }}>
            {/* Render LeafletView if os is web */}
            {/*Platform.OS === 'web' &&  // not showing properly on web, needs css load
                <MapContainer center={position} zoom={13} scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
              </MapContainer>
            */}

            {/* Render WebMapView if os is web */}
            {Platform.OS === 'web' &&
                <WebMapView
                    center={position}
                    zoom={13}
                    scrollWheelZoom={false}
                >

                </WebMapView>
            }


            

            {/* Render MapView if os is not web */}
            {Platform.OS !== 'web' &&

            <MapView
                style={{ flex: 1 }}
                region={region}
                onRegionChangeComplete={setRegion}
            >
                <UrlTile
                    urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                    flipY={false}
                />

                {location && <Marker coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }} title='You are here' description='Your current position' />}
                {/*selectedLocation && <Marker coordinate={{ latitude: selectedLocation.lat, longitude: selectedLocation.lon }} description={selectedLocation.display_name} />*/}
                {from && <Marker coordinate={{ latitude: parseFloat(from.lat), longitude: parseFloat(from.lon) }} description={from.display_name} />}
                {to && <Marker coordinate={{ latitude: parseFloat(to.lat), longitude: parseFloat(to.lon) }} description={to.display_name} />}

                {route && route.coordinates && <Polyline coordinates={route.coordinates} strokeColor="#000" strokeWidth={6} />}
            </MapView>}

            <View style={{ position: 'absolute', top: 70, right: 20 }}>
                <Button title="Center" onPress={handleCenterPress} />
            </View>

            {(!showRouteView && !showCircuitView) && <View style={{ position: 'absolute',bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 20 }}>  
                <Button title="New route" onPress={handleNewRoutePress} />
                <Button title="New circuit" onPress={handleNewCircuitPress} />
            </View>}

            {showRouteView && (
                <View>
                    <Text onPress={() => {
                        setShowSearchView(true);
                        setIsFromSelection(true);
                    }
                    }>
                        From : {from ? from.display_name : 'not selected'}
                    </Text>
                    <Text onPress={() => setShowSearchView(true)}>
                        To : {to ? to.display_name : 'not selected'}
                    </Text>
                    <Button title="Calculate route" onPress={() => {
                        console.log("calculating route");
                        /*axios.get(`https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`)
                            .then((res) => {
                                console.log(res.data);
                                console.log(res.data.routes[0].geometry);
                                //setRoute(res.data.routes[0].geometry);
                                console.log("setting polygone");
                                setPolygone(res.data.routes[0].geometry);
                                console.log("polygone set");
                            })
                            .catch((err) => {
                                console.error(err);
                            });*/
                            axios.get(`https://moto-tracker-route-api.shuttleapp.rs/calculate-route/?from_lat=${from.lat}&from_lon=${from.lon}&to_lat=${to.lat}&to_lon=${to.lon}`).then((res) => {
                                //console.log(res.data.path);
                                setPolygone(res.data.path);
                            }).catch((err) => {
                                console.error(err);
                            });
                    }} />
                </View>
            )}

            {showCircuitView && (
                <View>
                    <Text onPress={() => {
                        setShowSearchView(true);
                        setIsFromSelection(true);
                    }
                    }>
                        From : {from ? from.display_name : 'not selected'}
                    </Text>
                    <Button title="Calculate circuit" onPress={() => {
                        console.log("calculating circuit");
                        axios.get(`https://router.project-osrm.org/trip/v1/driving/${from.lon},${from.lat}?roundtrip=true&source=first&destination=last&geometries=geojson`)
                            .then((res) => {
                                console.log(res.data);
                                setCircuit(res.data);
                            })
                            .catch((err) => {
                                console.error(err);
                            });
                    }} />
                </View>
            )}

            {showSearchView && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'white', padding: 20 }}>
                    <TextInput
                        style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                        onChangeText={text => setSearchText(text)}
                        value={searchText}
                        onEndEditing={handleSearchChange}
                        />
                    {searchResults.length > 0 && <SectionList style={{backgroundColor:'white'}} sections={[{ title: 'Results', data: searchResults }]} renderItem={({ item }) => <Item item={item} onPress={() => selectLocation(item)}/>} keyExtractor={item => item.place_id} />}
                </View>
            )}
        </View>
    );
};

TaskManager.defineTask('location', ({ data, error }) => {
    if (error) {
        console.error(error);
        return;
    }

    if (data) {
        console.log("change data callback : ", data);
    }
});

export default Map;