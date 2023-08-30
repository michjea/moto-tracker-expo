import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import { useRouter } from 'expo-router';
import { set } from 'react-native-reanimated';
import axios from 'axios';
import { Card, Switch, Text, Button } from 'react-native-paper';
import MapView, {Marker, UrlTile, Polyline, Circle } from '../../components/mymap';
import { useLocalSearchParams } from "expo-router";
import axiosInstance from '../../components/axiosConfig';
import SafeAreaView from 'react-native-safe-area-context';

const Profile = () => {
    const router = useRouter();

    const GOOGLE_MAPS_APIKEY = 'AIzaSyDxQ8xL95GLxwFFpCNZd157j9Tw0e4he4Y';

    const [totalTime, setTotalTime] = useState(0);
    const [totalDistance, setTotalDistance] = useState(6000);

    const [user, setUser] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [followings, setFollowings] = useState([]);
    const [rides, setRides] = useState([]);

    const [routesPolyline, setRoutesPolyline] = useState([]);

    const map = React.useRef(null);

    const { id } = useLocalSearchParams();
    // get id from 

    React.useEffect(() => {
        const getRides = async () => {
            try {
                const result = await axiosInstance.get('user/' + id, {
                    headers: {
                        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`
                    }
                });

                console.log(result.data);

                setUser(result.data.user);
                setFollowers(result.data.followers);
                setFollowings(result.data.following);
                setRides(result.data.rides);

                let totalTime = 0;
                let totalDistance = 0;

                let routesPoly = [];
                result.data.rides.forEach(ride => {
                    totalTime += ride.duration;
                    totalDistance += ride.distance;

                    let polyline = [];
                    ride.route.forEach(route_ => {
                        console.log(route_.path);
                        polyline = polyline.concat(route_.path);
                    });
                    routesPoly.push(polyline);
                });

                console.log("routesPoly : ", routesPoly);

                setRoutesPolyline(routesPoly);
                setTotalTime(totalTime);
                setTotalDistance(totalDistance);

            } catch (e) {
                console.log(e)
            }
        }
        getRides();
    }, [])

    const showRide = (ride, index) => {
        console.log(index);
        console.log("show ride");
        router.replace('/rides/' + index);
        console.log("show ride 2");
    }

    return (
        <SafeAreaView>
            {/* Separate into three parts : rides count, followers count, followings count */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginTop: 30 }}>
            
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <Text variant="headlineLarge">{ rides.length }</Text>
                    <Text>rides</Text>
                </View>

                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <Text variant="headlineLarge">{ totalDistance/1000 }</Text>
                    <Text>km</Text>
                </View>

                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <Text variant="headlineLarge">{ totalTime/60 }</Text>
                    <Text>h</Text>
                </View>

                <Link href="/account/followers">
                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <Text variant="headlineLarge">{ followers.length }</Text>
                        <Text>followers</Text>
                    </View>
                </Link>

                <Link href="/account/following">
                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <Text variant="headlineLarge">{ followings.length }</Text>
                        <Text>followings</Text>
                    </View>
                </Link>

            </View>


            {/* TODO : Récupérer les rides dans l'asyncStorage et les afficher sous forme de liste de maps carrées (comme nos publications instagram) */}
            {rides.map((ride, index) => {
                return (
                    <View key={index}>
                    {/*<TouchableOpacity key={index} /> */}
                    {/**{/*onPress={() => showRide(ride, index)/*} */}
                    { ride.route[0].path[0] &&
                    <Card>
                        <Card.Content style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: 300 }}>
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', height: 200 }} >
                        <Link key={index} href={'/rides/' + ride.id}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', height: 200 }}>
                        <MapView
                            ref={map}
                            style={{ height: 200, width: 200 }}
                            region={{
                                latitude: ride.route[0].path[0].latitude,
                                longitude: ride.route[0].path[0].longitude,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421,
                            }}
                            provider="google"
                            googleMapsApiKey={GOOGLE_MAPS_APIKEY}
                        >
                        {/* Poly line with ride.path */}
                        { routesPolyline[index] &&
                        <Polyline
                            coordinates={routesPolyline[index]}
                            strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
                            strokeWidth={6}
                        />
                        }
                        </MapView>
                        </View>
                        </Link>
                        </View>
                        

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    {/* Print date and distance and duration */}
                    <Text>{ride.created_at} | </Text>
                    <Text>{ride.distance} km | </Text>
                    <Text>{ride.duration} h</Text>

                    </View>
                        <Button mode="contained" onPress={() => {
                            router.push('/rides/' + ride.id);
                        }}>Open</Button>
                        </Card.Content>
                </Card>
                }
                </View>
                );
            })}
        </SafeAreaView>
    );
};

export default Profile;