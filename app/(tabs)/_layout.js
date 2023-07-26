import { Tabs } from "expo-router"
import { Text, BottomNavigation } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default () => {

    const [userName, setUserName] = useState('Account');

    useEffect(() => {
        const getUser = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('user');
                if (jsonValue != null) {
                    const user = JSON.parse(jsonValue);
                    setUserName(user.name);
                } else {
                    console.log('No user found');
                }
            } catch (e) {
                console.log('Error while fetching user from asyncStorage');
                console.log(e);
            }
        };
        getUser();
    }, []);

    return (
        <Tabs initialRouteName="home" barStyle={{ backgroundColor: '#fff' }}>
                <Tabs.Screen name="home"
                    options={{
                        tabBarLabel: ({ focused }) => (
                            <Text style={{ color: focused ? '#c62828' : '#222' }}>
                                Home
                            </Text>
                        ),
                        tabBarIcon: ({ focused }) => (
                            <Icon
                                name="home"
                                size={25}
                                style={{ color: focused ? '#c62828' : '#222' }}
                            />
                        ),
                        headerShown: false,
                    }}

                />
                <Tabs.Screen name="map"
                    // Add icon here
                    options={{
                        tabBarLabel: ({ focused }) => (
                            <Text style={{ color: focused ? '#c62828' : '#222' }}>
                                Map
                            </Text>
                        ),
                        tabBarIcon: ({ focused }) => (
                            <Icon
                                name="map"
                                size={25}
                                style={{ color: focused ? '#c62828' : '#222' }}
                            />
                        ),
                        headerShown: false,
                    }}
                />
                <Tabs.Screen name="account/index" 
                    // Add icon here
                    options={{
                        tabBarLabel: ({ focused }) => (
                            <Text style={{ color: focused ? '#c62828' : '#222' }}>
                                Account
                            </Text>
                        ),
                        tabBarIcon: ({ focused }) => (
                            <Icon
                                name="account"
                                size={25}
                                style={{ color: focused ? '#c62828' : '#222' }}
                            />
                        ),
                        //header title is the user name from async storage
                        headerTitle: userName,

                    }}
                />
        </Tabs>
    );
};