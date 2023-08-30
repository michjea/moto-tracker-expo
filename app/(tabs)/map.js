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
import { DeviceMotion } from 'expo-sensors';
import axiosInstance from '../../components/axiosConfig';
//import test from '../../components/rotation';

// try to use mymap.web.js and mymap.js
//import MapView from 'react-native-maps';
import MapView, {Marker, UrlTile, Polyline, Circle } from '../../components/mymap';
import { useLocationContext } from '../../components/LocationContext';
import { setNavStarted, setRouteInstructions, setRegion, setMap } from '../../state/locationSlice';
import { useSelector, useDispatch } from "react-redux";

/*const DEFAULT_COORDINATE = {
    lat: 37.78825,
    lng: -122.4324,
  };  */

const Item = ({item, onPress}) => (
    <TouchableOpacity onPress={onPress} style={{backgroundColor:'white'}}>
      <Text>{item.display_name}</Text>
    </TouchableOpacity>
  );

//let foregroundSubscription = null;
let x = 0;

const Map = () => {
    const dispatch = useDispatch();
    //const [GOOGLE_MAPS_APIKEY, setGOOGLE_MAPS_APIKEY] = useState('AIzaSyDxQ8xL95GLxwFFpCNZd157j9Tw0e4he4Y');
    const [foregroundSubscription, setForegroundSubscription] = useState(null);
    const GOOGLE_MAPS_APIKEY = 'AIzaSyDxQ8xL95GLxwFFpCNZd157j9Tw0e4he4Y';
    //const url = 'https://moto-trackr.jeanne-michel.pro/api/'
    //const url = 'http://localhost:8000/api/'
    const router = useRouter();
    //const [position, setPosition] = useState(null);
    const { location, from, to, setSelectedField, setSelectedLocation, location_ } = useLocationContext();
    //const [location_, setLocation_] = useState(location);
    const [errorMsg, setErrorMsg] = useState(null);
    /*const [region, setRegion] = useState({
        latitude: 46.8182,
        longitude: 8.2275,
        latitudeDelta: 0.1922,
        longitudeDelta: 0.1421,
    });*/
    const region = useSelector((state) => state.location.region);

    // Search
    const [showSearchView, setShowSearchView] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // Route view
    const [showRouteView, setShowRouteView] = useState(false);
    const [isFromSelection, setIsFromSelection] = useState(false); // true = from, false = to

    // Circuit view
    const [showCircuitView, setShowCircuitView] = useState(false);
    const [distance, setDistance] = useState(0);
    const [orientation, setOrientation] = useState(0);

    // Route
    const [route, setRoute] = useState({});
    //const [currentInstruction, setCurrentInstruction] = useState("Start navigation");
    const currentInstruction = useSelector((state) => state.location.currentInstruction);
    const [instructionIndex, setInstructionIndex] = useState(0);
    //const [routeInstructions, setRouteInstructions] = useState([]);
    const routeInstructions = useSelector((state) => state.location.routeInstructions);
    const [totalDistance, setTotalDistance] = useState(0);
    const [routePolyline, setRoutePolyline] = useState([]);
    //const [pathDone, setPathDone] = useState([]);
    const pathDone = useSelector((state) => state.location.pathDone);
    // { positions : [{ lat, lon, speed, inclinations }, ...], distance, time }

    //const [startNavigation, setStartNavigation] = useState(false);
    const startNavigation = useSelector((state) => state.location.isNavStarted);
    const [startTime, setStartTime] = useState(0);

    const [coordinatesDelta, setCoordinatesDelta] = useState({
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    })
    const [zoomCoordinatesDelta, setZoomCoordinatesDelta] = useState({
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    })
    const [zoomCoordinatesDeltaNavigation, setZoomCoordinatesDeltaNavigation] = useState({
        latitudeDelta: 0.0022,
        longitudeDelta: 0.0011,
    })

    const map = React.useRef(null);

    //const map = useSelector((state) => state.location.map);

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

    const startForegroundLocation = async (isNav) => {
        if (!await askPermissions()) return;


        if (foregroundSubscription){
            foregroundSubscription?.remove();
            setForegroundSubscription(null);
        }

        let pathDone_ = [];

        x = x+1;
        let y = x;

        const newForegroundSubscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.BestForNavigation,
                distanceInterval: 10,
            },
            (location) => {
                console.log("foreground location " + y);//, location);

                setLocation_(location);
                
                if (isNav) {
                    console.log("location vs new location : ", location_, location);

                    /*map.current.animateToRegion({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: zoomCoordinatesDeltaNavigation.latitudeDelta,
                        longitudeDelta: zoomCoordinatesDeltaNavigation.longitudeDelta,
                    }, 100);*/

                    /*setRegion({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        latitudeDelta: zoomCoordinatesDeltaNavigation.latitudeDelta,
                        longitudeDelta: zoomCoordinatesDeltaNavigation.longitudeDelta,
                    });*/
                }

                let tilt_angle = {
                    alpha: 0,
                    beta: 0,
                    gamma: 0,
                    total_rotation: 0,
                }

                // print type of speed
                //console.log("type of speed : ", typeof location.coords.speed);
                console.log("callback start navigation : ", isNav);
                if (isNav){
                    console.log("adding position to pathDone");

                    pathDone_.push({
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        speed: location.coords.speed * 3.6,
                        altitude: location.coords.altitude,
                    });

                    // Calculer la distance entre la position actuelle et le point de l'instruction
                    // Si la distance est inférieure à 10 mètres, on passe à l'instruction suivante
                    // Si on est à la dernière instruction, on arrête la navigation

                    // Calculer la distance entre la position actuelle et le point de l'instruction
                    let distance = Math.sqrt(Math.pow(location.coords.latitude - routeInstructions[instructionIndex][2], 2) + Math.pow(location.coords.longitude - routeInstructions[instructionIndex][3], 2));
                    let distance_m = distance / 111320;
                    console.log("distance : ", distance_m);

                    // Si la distance est inférieure à 10 mètres, on passe à l'instruction suivante
                    if (instructionIndex === 0){
                        // give instruction with meters
                        //setCurrentInstruction(routeInstructions[instructionIndex][0] + " in " + Math.floor(distance_m) + " meters");
                        console.log("instruction " + routeInstructions[instructionIndex][0] + " in " + Math.floor(distance_m) + " meters");
                    }

                    if (distance_m < 10) {
                        console.log("distance inférieure à 10 mètres");
                        //setCurrentInstruction(routeInstructions[instructionIndex][0]);
                        setInstructionIndex(instructionIndex + 1);
                        console.log("instruction " + routeInstructions[instructionIndex][0]);
                    } else {
                        console.log("distance supérieure à 10 mètres");
                        // give instruction with meters
                        //setCurrentInstruction(routeInstructions[instructionIndex][0] + " in " + Math.floor(distance_m) + " meters");
                        console.log("instruction " + routeInstructions[instructionIndex][0] + " in " + Math.floor(distance_m) + " meters");
                    }

                    //setPathDone(pathDone_);

                }
            });

        setForegroundSubscription(newForegroundSubscription);
    };



    const stopForegroundLocation = async () => {
        foregroundSubscription?.remove();
        setForegroundSubscription(null);
        //foregroundSubscription = null;
    };
        
    useEffect(() => {
        (async () => {
            try {
                const response = await axiosInstance.get('google-maps-api-key');
                //console.log("google maps api key : ", response.data);
                
                //setGOOGLE_MAPS_APIKEY(response.data);
            } catch (err) {
                console.error("error while getting google maps api key : ", err);
            }

            if (!await askPermissions()) return;

            //startForegroundLocation(false);
        })();

        //subscribeDeviceMotion();
        //DeviceMotion.setUpdateInterval(1000);

        return () => {
            //unsubscribeDeviceMotion();
            stopForegroundLocation();
        }

    }, []);


    const [deviceMotion, setDeviceMotion] = useState({});
    const subscribeDeviceMotion = () => {
        DeviceMotion.addListener(deviceMotionData => {
            setDeviceMotion(deviceMotionData);
        });
    };
    const unsubscribeDeviceMotion = () => {
        DeviceMotion.removeAllListeners();
    };

    const handleCenterPress = async () => {
        if (!await askPermissions()) return;

        console.log("centering map");

        // navigate to current position if location is available
        if (location_ === null || location_ === undefined) {
            console.log("location is null or undefined");
            return;
        }

        //console.log("location : ", location_.coords.latitude, location_.coords.longitude);
        //console.log("zoom coordinates delta : ", zoomCoordinatesDelta.latitudeDelta, zoomCoordinatesDelta.longitudeDelta);
        //console.log("map : ", map.current);

        // Navigate to current position
        map.current.animateToRegion({
            latitude: location_.coords.latitude,
            longitude: location_.coords.longitude,
            latitudeDelta: zoomCoordinatesDelta.latitudeDelta,
            longitudeDelta: zoomCoordinatesDelta.longitudeDelta,
        }, 500);
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
        const instructions = [];
        // iterate over each data object
        for (let i = 0; i < data.length; i++) {
            // iterate over each point of the path
            for (let j = 0; j < data[i].path.length; j++) {
                // create the object
                coordinates.push({ latitude: data[i].path[j]["latitude"], longitude: data[i].path[j]["longitude"] });
            }
            for (let k = 0; k < data[i].instructions.length; k++) {
                // create the object
                instructions.push(data[i].instructions[k]);
            }
        }

        /*const coordinates = polygone.map((point) => {
            return { latitude: point["latitude"], longitude: point["longitude"] };
        });
        console.log("my coords : ", coordinates);*/
        //setRoute({ coordinates: coordinates });
        setRoutePolyline({ coordinates: coordinates });
        
        //setRouteInstructions(instructions);
        dispatch(setRouteInstructions(instructions));
    };


    const fetchRoute = async () => {
        console.log("calculating route");
                            axios.get(`https://moto-trackr-route-api.shuttleapp.rs/calculate-route/?from_lat=${from.lat}&from_lon=${from.lon}&to_lat=${to.lat}&to_lon=${to.lon}`).then((res) => {
                                console.log("itinerary : ", res.data);
                                setPolygone(res.data);
                                setRoute(res.data);

                                // for each item in array, increment total distance
                                
                                let tot_dist = 0;
                                for (let i = 0; i < res.data.length; i++) {
                                    tot_dist += res.data[i].total_distance;
                                }
                                setTotalDistance(tot_dist);

                            }).catch((err) => {
                                console.error(err);
                             });
    };

    const fetchCircuit = async () => {
        console.log("calculating circuit");
                        axios.get(`https://moto-trackr-route-api.shuttleapp.rs/calculate-loop/?from_lat=${from.lat}&from_lon=${from.lon}&distance=${distance}&orientation=${orientation}`).then((res) => {
                            setPolygone(res.data);
                            setRoute(res.data);
                        }).catch((err) => {
                            console.error(err);
                        });
    };

    const handleNavigation = async () => {
        // TODO
                        // - Doit avoir ma position comme départ
	                    // - Icône flèche (début juste un point bleu)
	                    // - Sens de la route
	                    // - Tourner la map dans le sens de la route
	                    // - Bouton arrêter
	                    // - Sauvegarde du temps
	                    // - Mauvais itinéraire ?

                        //setStartNavigation(true);
                        dispatch(setNavStarted(true));
                        //await stopForegroundLocation();
                        //startForegroundLocation(true);
                        console.log("handle navigation start navigation : ", startNavigation);
                        setShowRouteView(false);
                        setShowCircuitView(false);
                        setStartTime(new Date());

                        handleCenterPress();

                        // set coordinates delta to have more zoom
                        setCoordinatesDelta({
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        });
                    };
    
    const handleStopNavigation = async () => {
            //setStartNavigation(false);
            dispatch(setNavStarted(false));
            //await stopForegroundLocation();
            //startForegroundLocation(false);

            let endTime = new Date();
            let duration = endTime - startTime;

            // put duration in minutes
            duration = duration / 1000 / 60;

            console.log("end time : ", endTime);
            console.log("duration : ", duration);

            // pathDone is the routePolyline
            // For each point, we need to save the speed, the distance, the angle, etc.
            // Send random data for now
            //let pathDone = routePolyline.coordinates;
            /*let pathDoneData = [];
            for (let i = 0; i < pathDone.length; i++) {
                pathDoneData.push({
                    speed: Math.floor(Math.random() * 100),
                    //angle: Math.floor(Math.random() * 100),
                    altitude: Math.floor(Math.random() * 100),
                    latitude: pathDone[i].latitude,
                    longitude: pathDone[i].longitude,
                });
            }*/
            let pathDoneData = pathDone;

            //let distance = Math.floor(Math.random() * 100);

            // Get max speed and average speed
            let maxSpeed = 0;
            let averageSpeed = 0;

            for (let i = 0; i < pathDoneData.length; i++) {

                // print type of speed
                console.log("type of speed : ", typeof pathDoneData[i].speed, pathDoneData[i].speed);

                if (pathDoneData[i].speed > maxSpeed) {
                    maxSpeed = pathDoneData[i].speed;
                }
                averageSpeed += pathDoneData[i].speed;
            }

            console.log("average speed before division : ", averageSpeed);
            console.log("path done data length : ", pathDoneData.length);
            averageSpeed = averageSpeed / pathDoneData.length;
            console.log("average speed after division : ", averageSpeed);

            console.log("max speed : ", maxSpeed);
            console.log("average speed : ", averageSpeed);
            console.log("path done : ", pathDoneData);
            console.log("route : ", route);
            console.log("distance : ", totalDistance);
            console.log("duration : ", duration);

            let rideData = {
                title: "Ride " + new Date().toLocaleDateString(),
                description: "Ride from " + from.display_name + " to " + to.display_name,
                public: true,
                //created_at: new Date(),
                //updated_at: new Date(),
                distance: totalDistance,
                duration: duration,
                max_speed: maxSpeed,
                avg_speed: averageSpeed,
                positions: pathDoneData,
                route: route
            };

            console.log("ride data : ", rideData);

            // Save ride in API
            try {
                let res = await axiosInstance.post('ride', rideData, {
                    headers: {
                        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`
                    }
                });
                console.log("ride saved in API : ", res.data);
            } catch (err) {
                console.error("error while saving ride in API : ", err);
                // if 422, print error message
                if (err.response.status === 422) {
                    console.error("422 : ", err.response.data.errors);
                }
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
            setRoute(null);
        }


    return (
    
        <View style={{ flex: 1 }}>
            {/* Render MapView if os is not web */}
            {<MapView
                ref={map}
                style={{ flex: 1 }}
                region={region}
                /*onRegionChangeComplete={(region, gesture) => {
                    if (gesture) {
                        dispatch(setRegion(region));
                        console.log("region changed by user");
                    }
                }}*/
                provider="google"
                googleMapsApiKey={GOOGLE_MAPS_APIKEY}
                followsUserLocation={startNavigation}
                showsUserLocation={true}
            >
                {/*<UrlTile urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png" maximumZ={19} flipY={false} />*/}
                
                {/*selectedLocation && <Marker coordinate={{ latitude: selectedLocation.lat, longitude: selectedLocation.lon }} description={selectedLocation.display_name} />*/}
                {from && <Marker coordinate={{ latitude: parseFloat(from.lat), longitude: parseFloat(from.lon) }} description={from.display_name} />}
                {to && <Marker coordinate={{ latitude: parseFloat(to.lat), longitude: parseFloat(to.lon) }} description={to.display_name} />}

                {routePolyline && routePolyline.coordinates && <Polyline coordinates={routePolyline.coordinates} strokeColor="#000" strokeWidth={6} />}
            </MapView>}

            {/* Directions instructions */}
            {startNavigation && (
                <View style={{ position: 'absolute', top: 20, left: 0, right: 0, backgroundColor: 'white', padding: 10 }}>
                    <Text>{currentInstruction}</Text>
                </View>
            )} 

            {/* Center to current location */}
            <View style={{ position: 'absolute', top: 70, right: 20 }}>
                <Button mode="contained" onPress={handleCenterPress} disabled={location_ === null}>Center</Button>
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
                                setSelectedField('to');
                                router.push({ pathname:'/search-loc'});
                            }}
                            />
                    </View>

                    <View style={{ marginTop: 10 }}></View>

                    <Button mode="contained" onPress={fetchRoute}>Calculate route</Button>

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

                        <Button mode="outlined" onPress={handleNavigation}>Start navigation</Button>
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
                        <TextInput mode="outlined" maxLength={3} placeholder="Distance" onChangeText={(text) => {
                            text = text.replace(/[^0-9]/g, '');
                            setDistance(text.toString());
                        }} value={distance} />
                        <TextInput mode="outlined" maxLength={1} placeholder="Orientation" onChangeText={(text) => {
                            text = text.replace(/[^0-9]/g, '');
                            setOrientation(text.toString());
                        }} value={orientation} />
                    </View>

                    <View style={{ marginTop: 10 }}></View>
                    

                    <Button mode="contained" onPress={fetchCircuit} >Calculate circuit</Button>

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

                        <Button mode="outlined" onPress={handleNavigation}>Start navigation</Button>
                    </View>
                    }
                </View>
            )}

            {/* Start navigation */}
            {startNavigation && (
                <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'white', padding: 20 }}>
                    <Button mode="contained" onPress={handleStopNavigation} >Stop navigation</Button>
                </View>
            )}

        </View>
    );
};

export default Map;