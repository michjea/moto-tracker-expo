import React, { useState, useEffect } from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, {Marker, UrlTile, Polyline, Circle } from '../../components/mymap';
import axios from "axios";
import { Text, Button, TextInput, Searchbar, RadioButton } from 'react-native-paper';
import axiosInstance from "../../components/axiosConfig";

const Ride = () => {
    const { id } = useLocalSearchParams();

    const router = useRouter();

    // fetch ride from asyncStorage
    const [ride, setRide] = useState(null);

    const [maxSpeed, setMaxSpeed] = useState(100);
    const [maxInclination, setMaxInclination] = useState(30);
    const [totalTime, setTotalTime] = useState(1000);
    const [totalDistance, setTotalDistance] = useState(6000);
    const [routePolyline, setRoutePolyline] = useState([]);

    const map = React.useRef(null);
    const GOOGLE_MAPS_APIKEY = 'AIzaSyDxQ8xL95GLxwFFpCNZd157j9Tw0e4he4Y';
    
    const [checked, setChecked] = React.useState('Normal');

    const getColorForSpeed = (speed) => {
        const normalizedSpeed = speed / maxSpeed;
        const r = normalizedSpeed * 255;
        const g = 255 - normalizedSpeed * 255;
        const b = 0;
        return `rgb(${r}, ${g}, ${b})`;
    };

    useEffect(() => {
        console.log("useEffect");
        const getRide = async () => {
            try {
                const response = await axiosInstance.get('ride/' + id, {
                    headers: {
                        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`
                    }
                });

                setRide(response.data);
                setTotalTime(response.data.duration);
                setTotalDistance(response.data.distance);

                console.log(response.data);        

                const polylines = [];
                // For all positions in ride, 
                let firstPos = null;
                response.data.positions.forEach(position => {
                    // Add a polyline
                    if(firstPos == null) {
                        firstPos = position;
                    } else {
                        const obj = {};
                        const path = [{
                            latitude: position.latitude,
                            longitude: position.longitude
                        }, {
                            latitude: firstPos.latitude,
                            longitude: firstPos.longitude
                        }];
                        obj.path = path;
                        obj.color = getColorForSpeed(position.speed);
                        polylines.push(obj);
                        firstPos = position;
                    }
                });

                setRoutePolyline(polylines);

            } catch (e) {
                console.log(e);
            }
        };
        getRide();
    }, []);

    return (
        
        <SafeAreaView>
            
            {/* Add a stack navigator to go back to account page */}
            <Stack.Screen options={{ headerTitle: "Ride " + id, name: "ride" }} />

            {/*<TouchableOpacity onPress={() => router.replace('/account')}>
                <Text>Back to rides</Text>
                <Text>Ride #{id}</Text>
            </TouchableOpacity>*/}

            {ride &&  (
                <SafeAreaView style={{flex:1, width: '100%', height:'100%', margin:20}}>
                    <SafeAreaView style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <RadioButton.Group onValueChange={newValue => setChecked(newValue)} value={checked}>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Text>Normal</Text>
                                <RadioButton value="Normal" />
                            </View>
                            <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                <Text>Speed</Text>
                                <RadioButton value="Speed" />
                            </View>
                        </RadioButton.Group>
                    </SafeAreaView>

                    <View style={{ width: '90%', height:200 }}>
                        <MapView
                            ref={map}
                            initialRegion={{
                                latitude: ride.positions[0].latitude,   
                                longitude: ride.positions[0].longitude,
                            }}
                            initialCamera={
                                {
                                    center: {
                                        latitude: ride.positions[0].latitude,
                                        longitude: ride.positions[0].longitude,
                                    },
                                    zoom: 10

                            }}
                            provider="google"
                            googleMapsApiKey={GOOGLE_MAPS_APIKEY}
                        >

                        {/* Blue poly line with ride.path if renderMode is "normal" */}
                        {checked == "Normal" && (
                            <Polyline
                                coordinates={ride.positions.map(position => ({
                                    latitude: position.latitude,
                                    longitude: position.longitude
                                }
                                ))}
                                strokeColor="#0000FF"
                                strokeWidth={6}
                            />
                        )}

                        {/* Red poly line with ride.path if renderMode is "speed" */}
                        {checked == "Speed" && (
                            // Create mutlipke polylines with different colors
                            routePolyline.map((polyline, index) => (
                                <Polyline
                                    key={index}
                                    coordinates={polyline.path}
                                    strokeColor={polyline.color}
                                    strokeWidth={5}
                                />
                            ))
                        )}
                        </MapView>
                    </View>
                </SafeAreaView>)}
            

                <View>
                    <Text>Max speed : {maxSpeed} km/h</Text>
                    <Text>Total time : {totalTime / 60} minutes</Text>
                    <Text>Total distance : {totalDistance / 1000} kilometers</Text>
                </View>
        </SafeAreaView>
    );
}

export default Ride;