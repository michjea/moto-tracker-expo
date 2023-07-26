import React , {useState, useEffect} from 'react';
//import { View, Text, Button, TextInput, FlatList, SectionList, TouchableOpacity } from 'react-native';
import { View,FlatList, SectionList, TouchableOpacity } from 'react-native';
import { Text, Button, TextInput, Searchbar } from 'react-native-paper';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { set } from 'react-native-reanimated';
import {Platform, StyleSheet} from 'react-native';
//import { MapContainer, TileLayer, useMap, Marker as LeafletMarker, Popup, Polyline as LeafletPolyline } from 'react-leaflet'; // not showing properly on web, needs css load
//import /*MapView,*/ {Marker, UrlTile, Polyline, Circle } from 'react-native-maps';
//import { LatLng as LeafletLatLng, LeafletView } from 'react-native-leaflet-view'; // needs web view -> not compatible with web
//import MapView from '@teovilla/react-native-web-maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Gyroscope } from 'expo-sensors';
import { Accelerometer } from 'expo-sensors';
import { Avatar } from 'react-native-paper';

// try to use mymap.web.js and mymap.js
//import MapView from '@teovilla/react-native-web-maps';

import MapView, {Marker, UrlTile, Polyline, Circle } from '../../components/mymap';
import { useLocationContext } from '../../components/LocationContext';

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

    //const GOOGLE_MAPS_APIKEY = 'AIzaSyDxQ8xL95GLxwFFpCNZd157j9Tw0e4he4Y';

    const [GOOGLE_MAPS_APIKEY, setGOOGLE_MAPS_APIKEY] = useState('');

    // Router
    const router = useRouter();

    const [position, setPosition] = useState(null);

    const { location, from, to, setSelectedField, setSelectedLocation } = useLocationContext();

    // Location
    //const [location, setLocation] = useState(null);
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
    //const [selectedLocation, setSelectedLocation] = useState(null);
    const [searchResults, setSearchResults] = useState([]);

    // Route view
    const [showRouteView, setShowRouteView] = useState(false);
    const [isFromSelection, setIsFromSelection] = useState(false); // true = from, false = to
    //const [from, setFrom] = useState(null);
    //const [to, setTo] = useState(null);

    // Circuit view
    const [showCircuitView, setShowCircuitView] = useState(false);
    const [distance, setDistance] = useState(0);

    // Route
    const [route, setRoute] = useState({});
    const [totalDistance, setTotalDistance] = useState(0);
    const [routePolyline, setRoutePolyline] = useState([]);
    const [pathDone, setPathDone] = useState(false);
    // { positions : [{ lat, lon, speed, inclinations }, ...], distance, time }

    const [startNavigation, setStartNavigation] = useState(false);
    const [startTime, setStartTime] = useState(0);

    const [coordinatesDelta, setCoordinatesDelta] = useState({
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    })

    const map = React.useRef(null);

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

            try {
                const response = await axios.get('https://moto-trackr.jeanne-michel.pro/api/google-maps-api-key');
                console.log("google maps api key : ", response.data);
                
                setGOOGLE_MAPS_APIKEY(response.data);
            } catch (err) {
                console.error("error while getting google maps api key : ", err);
            }

            //subscribeGyroscope();
            //subscribeAccelerometer();

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

                    //console.log("location callback : ", location);
                    //setLocation(location);

                    console.log(location.coords.latitude, location.coords.longitude);

                    if (startNavigation) {
                        setRegion({
                            latitude: location.coords.latitude,
                            longitude: location.coords.longitude,
                            latitudeDelta: coordinatesDelta.latitudeDelta,
                            longitudeDelta: coordinatesDelta.longitudeDelta,
                        });
                    }

                    /*setRegion({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: 0.0922,
                        longitudeDelta: 0.0421,
                    });*/
                }
            );

        })();

        subscribeGyroscope();
        Gyroscope.setUpdateInterval(500);

        subscribeAccelerometer();
        Accelerometer.setUpdateInterval(500);

        return () => {
            unsubscribeGyroscope();
            unsubscribeAccelerometer();
        }

    }, []);

    // GYROSCOPE \\
    const [{x,y,z}, setGyroscopeData] = useState({x:0,y:0,z:0});
    const [gyroscopeSubscription, setGyroscopeSubscription] = useState(null);

    const subscribeGyroscope = () => {
        setGyroscopeSubscription(
            Gyroscope.addListener(gyroscopeData => {
                setGyroscopeData(gyroscopeData);
                console.log("gyroscope data : ", gyroscopeData);
                
                // Log in editor console the gyroscope data
        
            })
        );
    };

    const unsubscribeGyroscope = () => {
        gyroscopeSubscription && gyroscopeSubscription.remove();
        setGyroscopeSubscription(null);
    };


    // ACCELEROMETER \\
    const [{xa,ya,za}, setAccelerometerData] = useState({xa:0,ya:0,za:0});
    const [accelerometerSubscription, setAccelerometerSubscription] = useState(null);

    const subscribeAccelerometer = () => {
        setAccelerometerSubscription(
            Accelerometer.addListener(accelerometerData => {
                setAccelerometerData(accelerometerData);
                console.log("accelerometer data : ", accelerometerData);
            })
        );
    };
    
    const unsubscribeAccelerometer = () => {
        accelerometerSubscription && accelerometerSubscription.remove();
        setAccelerometerSubscription(null);
    };


    const handleCenterPress = async () => {
        if (!await askPermissions()) return;

        console.log("centering map");

        setRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: coordinatesDelta.latitudeDelta,
            longitudeDelta: coordinatesDelta.longitudeDelta,
        });

        // Navigate to current position
        map.current.animateToRegion({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: coordinatesDelta.latitudeDelta,
            longitudeDelta: coordinatesDelta.longitudeDelta,
        }, 1000);
    };

    const handleNewRoutePress = () => {
        setShowRouteView(true);
    };

    const handleNewCircuitPress = () => {
        setShowCircuitView(true);
    };

    const handleSearchChange = async (text) => {
        // call nominatim api to get location
        console.log("searching : ", searchText);
        const results = await axios.get(`https://nominatim.openstreetmap.org/search?q=${text}&format=json&addressdetails=1&limit=5`);
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

    const setPolygone = (data) => {
        // data is an array of objects. Each object has an attribute "path" which is an array of points. I want each point to be an object with latitude and longitude attributes
        const coordinates = [];
        // iterate over each data object
        for (let i = 0; i < data.length; i++) {
            // iterate over each point of the path
            for (let j = 0; j < data[i].path.length; j++) {
                // create the object
                coordinates.push({ latitude: data[i].path[j]["latitude"], longitude: data[i].path[j]["longitude"] });
            }
        }

        /*const coordinates = polygone.map((point) => {
            return { latitude: point["latitude"], longitude: point["longitude"] };
        });
        console.log("my coords : ", coordinates);*/
        //setRoute({ coordinates: coordinates });
        setRoutePolyline({ coordinates: coordinates });
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
            {/*Platform.OS === 'web' &&
                <MapView
                style={{ flex: 1 }}
                //region={region}
                onRegionChangeComplete={setRegion}
                provider="google"
                googleMapsApiKey={GOOGLE_MAPS_APIKEY}
            ></MapView>*/
            }

            {/* Render MapView if os is not web */}
            {Platform.OS !== 'web' || Platform.OS === 'web' &&

            <MapView
                ref={map}
                style={{ flex: 1 }}
                region={region}
                onRegionChangeComplete= {(region) => {
                    setRegion(region);
                    console.log("region : ", region);
                }}
                provider="google"
                googleMapsApiKey={GOOGLE_MAPS_APIKEY}
            >
                {/*<UrlTile urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} flipY={false} />*/}
                
                {location && 
                    <Circle center={{ latitude: location.coords.latitude, longitude: location.coords.longitude }} radius={location.coords.accuracy} fillColor="rgba(0, 0, 255, 0.1)" strokeColor="rgba(0, 0, 255, 0.1)" />
                }
                
                {/* Light blue marker */}
                {location && <Marker coordinate={{ latitude: location.coords.latitude, longitude: location.coords.longitude }} description="Your current position" pinColor={'#1560BD'} />}
                
                {/*selectedLocation && <Marker coordinate={{ latitude: selectedLocation.lat, longitude: selectedLocation.lon }} description={selectedLocation.display_name} />*/}
                {from && <Marker coordinate={{ latitude: parseFloat(from.lat), longitude: parseFloat(from.lon) }} description={from.display_name} />}
                {to && <Marker coordinate={{ latitude: parseFloat(to.lat), longitude: parseFloat(to.lon) }} description={to.display_name} />}

                {routePolyline && routePolyline.coordinates && <Polyline coordinates={routePolyline.coordinates} strokeColor="#000" strokeWidth={6} />}
            </MapView>}

            {/* Center to current location */}
            <View style={{ position: 'absolute', top: 70, right: 20 }}>
                <Button mode="contained" onPress={handleCenterPress}>Center</Button>
            </View>

            {/* New route or new circuit */}
            {(!showRouteView && !showCircuitView && !startNavigation) && <View style={{ position: 'absolute',bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 10 }}>  
                <Button mode="contained" onPress={handleNewRoutePress}>New route</Button>

                <View style={{ marginTop: 10 }}></View>

                <Button mode="contained" onPress={handleNewCircuitPress}>New circuit</Button>
            </View>}

            {/* Select start and stop of route */}
            {showRouteView && (
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 10 }}>
                    {/* Back button icon to go back to previous view, align left */}
                    <Button mode="text" icon="arrow-left" onPress={() => setShowRouteView(false)} style={{ position: 'absolute', left: 0, top: 10 }} />

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                        <Text>
                            From
                        </Text>
                        <TextInput placeholder="From" value={from ? from.display_name : ''} 
                            mode="outlined" style={{ flex: 1, marginLeft: 10 }}

                            onFocus={() => {
                                setSelectedField('from');
                                router.push({ pathname:'/search-loc'});
                            }}
                            />
                    </View>
                    
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text onPress={() => setShowSearchView(true)}>
                        To
                    </Text>
                    <TextInput placeholder="From" value={to ? to.display_name : ''} 
                            mode="outlined" style={{ flex: 1, marginLeft: 27 }}
                            
                            onFocus={() => {
                                // Open search view
                                setSelectedField('to');
                                router.push({ pathname:'/search-loc'});
                            }}
                            />
                    </View>

                    <View style={{ marginTop: 10 }}></View>

                    <Button mode="contained" onPress={() => {
                        console.log("calculating route");
                            axios.get(`https://moto-trackr-route-api.shuttleapp.rs/calculate-route/?from_lat=${from.lat}&from_lon=${from.lon}&to_lat=${to.lat}&to_lon=${to.lon}`).then((res) => {
                                console.log("itinerary : ", res.data);
                                setPolygone(res.data);
                                setRoute(res.data);

                                // for each item in array, increment total distance
                                setTotalDistance(0);
                                for (let i = 0; i < res.data.length; i++) {
                                    setTotalDistance(totalDistance + res.data[i].total_distance);
                                }

                            }).catch((err) => {
                                console.error(err);
                            });
                    }}>Calculate route</Button>

                    {routePolyline && routePolyline.coordinates && 
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginTop: 10 }}>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Avatar.Icon size={40} icon="map-marker-distance" color='grey' style={{ backgroundColor: 'white' }} />
                            <Text>{Math.floor(totalDistance / 1000)} km</Text>
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Avatar.Icon size={40} icon="clock-outline" color='grey' style={{ backgroundColor: 'white' }} />
                            <Text>{((totalDistance / 1000 * 1.23) / 60).toFixed(2)} h</Text>
                        </View>

                        <Button mode="outlined" onPress={() => {
                        // TODO
                        // - Doit avoir ma position comme départ
	                    // - Icône flèche (début juste un point bleu)
	                    // - Sens de la route
	                    // - Tourner la map dans le sens de la route
	                    // - Bouton arrêter
	                    // - Sauvegarde du temps
	                    // - Mauvais itinéraire ?

                        setStartNavigation(true);
                        setShowRouteView(false);
                        setStartTime(new Date());

                        handleCenterPress();

                        // set coordinates delta to have more zoom
                        setCoordinatesDelta({
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        });
                    }}>Start navigation</Button>
                    </View>
                    }
                </View>
            )}

            {/* Select start of circuit */}
            {showCircuitView && (
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 10 }}>
                    <Button mode="text" icon="arrow-left" onPress={() => setShowCircuitView(false)} style={{ position: 'absolute', left: 0, top: 10 }} />

                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
                        <Text>
                            From
                        </Text>
                        <TextInput placeholder="From" value={from ? from.display_name : ''} 
                            mode="outlined" style={{ flex: 1, marginLeft: 10 }}

                            onFocus={() => {
                                setSelectedField('from');
                                router.push({ pathname:'/search-loc'});
                            }}
                            />
                    </View>

                    <View style={{ marginTop: 10 }}></View>

                    {/* Distance selection */}
                    <TextInput mode="outlined" numeric placeholder="Distance" onChangeText={setDistance} value={distance} />
                    
                    <View style={{ marginTop: 10 }}></View>

                    <Button mode="contained" onPress={() => {
                        console.log("calculating circuit");
                        axios.get(`https://moto-trackr-route-api.shuttleapp.rs/calculate-loop/?from_lat=${from.lat}&from_lon=${from.lon}&distance=${distance}`).then((res) => {
                            setPolygone(res.data);
                            setRoute(res.data);
                        }).catch((err) => {
                            console.error(err);
                        });
                    }} >Calculate circuit</Button>


                    {route && route.coordinates && <Button title="Start navigation" onPress={() => {
                        setStartNavigation(true);
                        setShowRouteView(false);
                        setShowCircuitView(false);
                        setShowSearchView(false);
                        setStartTime(new Date());

                        handleCenterPress();

                        // set coordinates delta to have more zoom
                        setCoordinatesDelta({
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        });
                    }} />}
                </View>
            )}

            {/* Search view */}
            {showSearchView && (
                <View style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: 'white', padding: 20 }}>
                    <Searchbar
                        onChangeText={text => {
                            setSearchText(text);
                            console.log("search text : ", text);
                            handleSearchChange(text);
                        }}
                        value={searchText}
                        //onEndEditing={handleSearchChange}
                        />
                    {searchResults.length > 0 && <SectionList style={{backgroundColor:'white'}} sections={[{ title: 'Results', data: searchResults }]} renderItem={({ item }) => <Item item={item} onPress={() => selectLocation(item)}/>} keyExtractor={item => item.place_id} />}
                </View>
            )}

            {/* Start navigation */}
            {startNavigation && (
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 20 }}>
                    <Button mode="contained" onPress={async () => {
                        setStartNavigation(false);
                        setRoute(null);

                        let endTime = new Date();
                        let duration = endTime - startTime;

                        // put duration in minutes
                        duration = duration / 1000 / 60;

                        console.log("end time : ", endTime);
                        console.log("duration : ", duration);

                        // - sauvegarder la balade
	                    // - sur le stockage local et à l'api si connecté    
                        // - API -> POST /api/rides with data : { start_time, end_time, path, distance, duration, user_id }                    
                        // - sauvegarder les données de vitesse, distance, angle d'inclinaison, etc. toutes les secondes

                        // pathDone is the routePolyline
                        // For each point, we need to save the speed, the distance, the angle, etc.
                        // Send random data for now
                        let pathDone = routePolyline.coordinates;
                        let pathDoneData = [];
                        for (let i = 0; i < pathDone.length; i++) {
                            pathDoneData.push({
                                speed: Math.floor(Math.random() * 100),
                                angle: Math.floor(Math.random() * 100),
                                latitude: pathDone[i].latitude,
                                longitude: pathDone[i].longitude,
                            });
                        }

                        let ride = route;
                        let distance = Math.floor(Math.random() * 100);

                        // Get max speed and average speed
                        let maxSpeed = 0;
                        let averageSpeed = 0;

                        for (let i = 0; i < pathDoneData.length; i++) {
                            if (pathDoneData[i].speed > maxSpeed) {
                                maxSpeed = pathDoneData[i].speed;
                            }
                            averageSpeed += pathDoneData[i].speed;
                        }

                        averageSpeed = averageSpeed / pathDoneData.length;

                        let title = "Ride " + new Date().toLocaleDateString();
                        let description = "Ride from " + from.display_name + " to " + to.display_name;

                        /* Model in API is :
                        {protected $fillable = [
                            'user_id',
                            'title',
                            'description',
                            'public',
                            'created_at',
                            'updated_at',
                            'distance',
                            'duration',
                            'max_speed',
                            'avg_speed',
                            'positions',
                        ];

                        // Casts
                        protected $casts = [
                            'positions' => 'array',
                        ];
                        */

                        let user_id = 1;

                        let rideData = {
                            title: title,
                            description: description,
                            public: true,
                            //created_at: new Date(),
                            //updated_at: new Date(),
                            distance: distance,
                            duration: duration,
                            max_speed: maxSpeed,
                            avg_speed: averageSpeed,
                            positions: pathDoneData,
                        };

                        // Save ride in API
                        try {
                            let res = await axios.post('https://moto-trackr.jeanne-michel.pro/api/ride', rideData, {
                                headers: {
                                    Authorization: `Bearer ${await AsyncStorage.getItem('token')}`
                                }
                            });
                            console.log("ride saved in API : ", res.data);
                        } catch (err) {
                            console.error("error while saving ride in API : ", err);
                        }

                        /*if (rides) {
                            const ridesArray = JSON.parse(rides);
                            ridesArray.push({
                                start_time: startTime,
                                end_time: endTime,
                                path: routePolyline.coordinates,
                                //distance: route.distance,
                                duration: duration,
                                user_id: 1,
                            });
                            console.log("rides : ", ridesArray);
                            await AsyncStorage.setItem('rides', JSON.stringify(ridesArray));
                            console.log("rides saved");
                        } else {
                            await AsyncStorage.setItem('rides', JSON.stringify([{
                                start_time: startTime,
                                end_time: endTime,
                                path: routePolyline.coordinates,
                                //distance: route.distance,
                                duration: duration,
                                user_id: 1,
                            }]));
                            console.log("rides saved");
                        }*/
                    }} >Stop navigation</Button>
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