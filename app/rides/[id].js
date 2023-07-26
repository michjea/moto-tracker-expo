import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { router } from "expo-router";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MapView, { Polyline } from "react-native-maps";
import { Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const Ride = () => {
    const { id } = useLocalSearchParams();

    const router = useRouter();

    // fetch ride from asyncStorage
    const [ride, setRide] = useState(null);

    const [renderMode, setRenderMode] = useState("normal");

    const [maxSpeed, setMaxSpeed] = useState(100);
    const [maxInclination, setMaxInclination] = useState(30);
    const [totalTime, setTotalTime] = useState(1000);
    const [totalDistance, setTotalDistance] = useState(6000);

    useEffect(() => {
        console.log("useEffect");
        const getRide = async () => {
            try {
                console.log("Fetching rides from asyncStorage");
                const jsonValue = await AsyncStorage.getItem("rides");
                if (jsonValue != null) {
                    console.log("Rides found");
                    const rides = JSON.parse(jsonValue);
                    setRide(rides[id]);
                } else {
                    console.log("No rides found");
                }
            } catch (e) {
                console.log("Error while fetching rides from asyncStorage");
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
                <MapView
                style={{ width: "90%", height: 300, alignSelf: "center" }}
                region={{
                    latitude: ride.path[0].latitude,
                    longitude: ride.path[0].longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                >

                {/* Blue poly line with ride.path if renderMode is "normal" */}
                {renderMode == "normal" && (
                    <Polyline
                        coordinates={ride.path}
                        strokeColor="#0000FF"
                        strokeWidth={6}
                    />
                )}

                {/* Red poly line with ride.path if renderMode is "speed" */}
                {renderMode == "speed" && (
                    <Polyline
                        coordinates={ride.path}
                        strokeColor="#FF0000"
                        strokeWidth={6}
                    />
                )}

                {/* Green poly line with ride.path if renderMode is "inclination" */}
                {renderMode == "inclination" && (
                    <Polyline
                        coordinates={ride.path}
                        strokeColor="#00FF00"
                        strokeWidth={6}
                    />
                )}
            </MapView>)}

                <View>
                    <TouchableOpacity onPress={() => setRenderMode("normal")}>
                        <Text>Normal</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setRenderMode("speed")}>
                        <Text>Speed</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setRenderMode("inclination")}>
                        <Text>Inclination</Text>
                    </TouchableOpacity>
                </View>

                <View>
                    <Text>Max speed : {maxSpeed} km/h</Text>
                    <Text>Max inclination : {maxInclination} %</Text>
                    <Text>Total time : {totalTime / 60} minutes</Text>
                    <Text>Total distance : {totalDistance / 1000} kilometers</Text>
                </View>
                
        
        </SafeAreaView>
    );
}

export default Ride;