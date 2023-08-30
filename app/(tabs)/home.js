import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { Card, Searchbar, Switch, Text, Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import { set } from 'react-native-reanimated';
import axiosInstance from '../../components/axiosConfig';
import MapView, {Polyline} from '../../components/mymap';
import { ScrollView } from 'react-native-gesture-handler';
import SafeAreaView from 'react-native-safe-area-context';

const Home = () => {

    const router = useRouter();
    const [searchText, setSearchText] = useState('');

    const [posts, setPosts] = useState([]);
    const [routesPolyline, setRoutesPolyline] = useState([]); // [ [route1], [route2], ...
    const [offset, setOffset] = useState(0);
    const [message, setMessage] = useState('');

    const GOOGLE_MAPS_APIKEY = 'AIzaSyDxQ8xL95GLxwFFpCNZd157j9Tw0e4he4Y';

    const dateToString = (date) => {
        let date_ = new Date(date);
        return date_.toLocaleDateString() + " " + date_.toLocaleTimeString();
    }

    useEffect(() => {

        async function getPosts() {
            setSearchText('');

            try {
                const result = await axiosInstance.get(`feed/?offset=${offset}`, {
                    headers: {
                        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`
                    }
                });

                if (result.data.message) {
                    setMessage(result.data.message);
                    
                } else {
                    // add result.data to existing posts
                    setPosts(...posts, result.data);

                    // increment offset
                    setOffset(offset + result.data.length);

                    let routesPoly = [];
                    result.data.forEach((post) => {
                        let polyline = [];
                        post.route.forEach(route_ => {
                            polyline = polyline.concat(route_.path);
                        });
                        routesPoly.push(polyline);
                    });
                    setRoutesPolyline(...routesPolyline, routesPoly);

                }
            } catch (e) {
                console.log("Error fetching posts on home page");
                console.log(e);
            }
        }

        getPosts();
    }, []);

    return (
        
        <ScrollView style={{ padding: 20 }}>
            {/* Search users bar */}
            <Searchbar
                placeholder="Search for friends"
                value={searchText}
                style={{ backgroundColor: 'white' }}
                // On press, stack search page
                onChangeText={async (query) => {
                    router.push({
                        pathname: '/search',
                        params: {
                            q: query
                        }
                    });
                }}

            />
            {/* Posts */}
            <View style={{ marginTop: 20 }}>
                {posts.map((post, index) => {
                    return (
                        <View key={post.id} style={{ marginBottom: 20 }}>
                            <Text style={{ fontWeight: 'bold' }}>@{post.user.name}</Text>
                            <Card style={{margin: 10}}>
                        <Card.Content style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'}}>
                            {/*<Link href={"/rides/"+ride.id} style={{width:'100%', height: '100%'}}>*/}
                            <View style={{width:'100%', height: 200}}>
                            <MapView
                                //ref={map}
                                initialRegion={{
                                    latitude: post.route[0].path[0].latitude,
                                    longitude: post.route[0].path[0].longitude,
                                }}
                                initialCamera={{
                                    center: {
                                        latitude: post.route[0].path[0].latitude,
                                        longitude: post.route[0].path[0].longitude,
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
                            <Text>{dateToString(post.created_at)} | </Text>
                            <Text>{post.distance} km | </Text>
                            <Text>{post.duration} h</Text>
                        </View>

                        <Button mode="contained" onPress={() => router.push('/rides/'+post.id)}>Show ride</Button>
                    </Card.Content>
                </Card>

                        </View>
                    );
                })}
            </View>
            {/* Message */}
            <Text variant="headlineSmall" style={{ alignItems: 'center' }}>{message}</Text>

        </ScrollView>
        
    );
};

export default Home;