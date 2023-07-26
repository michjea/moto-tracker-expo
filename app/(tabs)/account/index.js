import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView from 'react-native-maps';
import { Polyline } from 'react-native-maps';
// import router
import { Link, router } from 'expo-router';
import { useRouter } from 'expo-router';
import { set } from 'react-native-reanimated';
import axios from 'axios';
import { Text } from 'react-native-paper';

const Account = () => {

    const [rides, setRides] = useState([]);

    const router = useRouter();

    const [totalTime, setTotalTime] = useState(0);
    const [totalDistance, setTotalDistance] = useState(6000);

    const [user, setUser] = useState(null);
    const [followers, setFollowers] = useState([]);
    const [followings, setFollowings] = useState([]);

    React.useEffect(() => {
        const getRides = async () => {
            try {
                const result = await axios.get('http://127.0.0.1:8000/api/users/me', {
                    headers: {
                        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`
                    }
                });

                console.log(result.data);

                setUser(result.data.user);
                setFollowers(result.data.followers);
                setFollowings(result.data.following);
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
        <View>
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
                    <Link key={index} href={'/rides/' + index}>
                    {/*<TouchableOpacity key={index} /> */}
                    {/**{/*onPress={() => showRide(ride, index)/*} */}
                <View key={index}>
                    <Text>{ride.path[0].longitude}</Text>
                    <MapView
                        style={{ width: 100, height: 100 }}
                        region={{
                            latitude: ride.path[0].latitude,
                            longitude: ride.path[0].longitude,
                            latitudeDelta: 0.0922,
                            longitudeDelta: 0.0421,
                        }}
                    >
                        {/* Poly line with ride.path */}
                        <Polyline
                            coordinates={ride.path}
                            strokeColor="#000" // fallback for when `strokeColors` is not supported by the map-provider
                            strokeWidth={6}
                        />
                    </MapView>
                </View>
                {/*</Link></TouchableOpacity>*/}
                </Link>
                );
            })}
        </View>
    );
};

export default Account;