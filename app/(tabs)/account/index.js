import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, router } from 'expo-router';
import { useRouter } from 'expo-router';
import { set } from 'react-native-reanimated';
import axios from 'axios';
import { Card, Switch, Text, Button } from 'react-native-paper';
import MapView, {Marker, UrlTile, Polyline, Circle } from '../../../components/mymap';
import axiosInstance from '../../../components/axiosConfig';
import * as FileSystem from 'expo-file-system';
import SafeAreaView from 'react-native-safe-area-context';

const Account = () => {
    const router = useRouter();

    const GOOGLE_MAPS_APIKEY = 'AIzaSyDxQ8xL95GLxwFFpCNZd157j9Tw0e4he4Y';

    const [totalTime, setTotalTime] = useState(0);
    const [totalDistance, setTotalDistance] = useState(6000);

    const [user, setUser] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [followings, setFollowings] = useState([]);
    const [rides, setRides] = useState([]);

    const [routesPolyline, setRoutesPolyline] = useState([]);

    //const url = 'http://localhost:8000/api/';

    const map = React.useRef(null);

    React.useEffect(() => {
        const getRides = async () => {
            try {
                const result = await axiosInstance.get('user/account', {
                    headers: {
                        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`
                    }
                });

                if (typeof result.data === 'object') {
                    console.log(result.data);

                    console.log("user : ",result.data.user);

                    console.log("following : ",result.data.following);

                    console.log("followers : ",result.data.followers);
                } else {
                    if (typeof result.data === 'string') {
                        console.log("result.data is a string");

                        // Try to parse it
                        try {
                            // add a bracket at the end of the string
                            result.data = result.data + "}";

                            let resultParsed = JSON.parse(result.data);
                            console.log("resultParsed : ",resultParsed);
                        } catch (e) {
                            console.log("result.data is not a JSON string");

                            // print first 100 characters
                            console.log("result.data : ",result.data.substring(0, 100));

                            // print last 100 characters
                            console.log("result.data : ",result.data.substring(result.data.length - 100, result.data.length));

                            
                        }
                    } else {
                        console.log("result.data is not an object nor a string");
                    }
                    return;
                }

                

                //console.log("rides : ",result.data.rides);

                setUser(result.data.user);
                setFollowers(result.data.followers);
                setFollowings(result.data.following);
                setRides(result.data.rides);

                let totalTime = 0;
                let totalDistance = 0;

                let routesPoly = [];

                if (result.data.rides !== undefined) {
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
                }

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

    const dateToString = (date) => {
        let date_ = new Date(date);
        return date_.toLocaleDateString() + " " + date_.toLocaleTimeString();
    }

    return (

        <SafeAreaView>        
            {/* Separate into three parts : rides count, followers count, followings count */}
            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', marginTop: 30 }}>
            
                <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                    <Text variant="headlineLarge">{ rides !== undefined ? rides.length : 0 }</Text>
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
                        <Text variant="headlineLarge">{ followers !== undefined ? followers.length : 0 }</Text>
                        <Text>followers</Text>
                    </View>
                </Link>

                <Link href="/account/following">
                    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                        <Text variant="headlineLarge">{ followings !== undefined ? followings.length : 0 }</Text>
                        <Text>followings</Text>
                    </View>
                </Link>

            </View>


            {/* TODO : Récupérer les rides dans l'asyncStorage et les afficher sous forme de liste de maps carrées (comme nos publications instagram) */}
            {rides !== undefined && (rides.map((ride, index) => {
                return (
                    <View key={index}>
                    { ride.route[0].path[0] &&
                    <Card style={{margin: 10}}>
                        <Card.Content style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: 10}}>
                            {/*<Link href={"/rides/"+ride.id} style={{width:'100%', height: '100%'}}>*/}
                            <View style={{width:'100%', height: 200}}>
                            <MapView
                                ref={map}
                                initialRegion={{
                                    latitude: ride.route[0].path[0].latitude,
                                    longitude: ride.route[0].path[0].longitude,
                                }}
                                initialCamera={{
                                    center: {
                                        latitude: ride.route[0].path[0].latitude,
                                        longitude: ride.route[0].path[0].longitude,
                                    },
                                    zoom: 10
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
                            {/*</Link>*/}
                        
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
                            {/* Print date and distance and duration */}
                            <Text>{dateToString(ride.created_at)} | </Text>
                            <Text>{ride.distance} km | </Text>
                            <Text>{ride.duration} h |  Public ? </Text>

                            {/* Toggle button public/private */}
                            <Switch value={ride.public} onValueChange={async () => {
                                try {
                                    setRides(rides.map((ride_, index_) => {
                                        if (index_ === index) {
                                            ride_.public = !ride_.public;
                                        }
                                        return ride_;
                                    }));

                                    let res = await axiosInstance.patch('ride/' + ride.id, {
                                        public: ride.public,
                                    }, {
                                        headers: {
                                            Authorization: `Bearer ${await AsyncStorage.getItem('token')}`
                                        }
                                    });
                                    console.log(res.data);
                                } catch (e) {
                                    console.log(e);
                                }
                            }} />
                        </View>

                        <Button mode="contained" onPress={() => router.push('/rides/'+ride.id)}>Show ride</Button>
                    </Card.Content>
                </Card>
                }
                </View>
                );
            }))}
        </SafeAreaView>
    );
};

export default Account;