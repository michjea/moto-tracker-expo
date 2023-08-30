import axios from "axios";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput, Button, HelperText, List } from "react-native-paper";
import { View } from "react-native";
import { useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from "../../components/axiosConfig";

export default () => {

    const [following, setFollowing] = useState([]);

    //const url = 'https://moto-trackr.jeanne-michel.pro/api/'
    //const url = 'http://localhost:8000/api/'

    const fetchFollowing = async () => {
        try {
            const response = await axiosInstance.get("user/following", {
                headers: {
                    Authorization: `Bearer ${await AsyncStorage.getItem('token')}`
                }
            });
            console.log(response.data);
            setFollowing(response.data.following);
        }
        catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchFollowing();
    }, []);

    return (
        <SafeAreaView>
            {/*Message if no followers*/}
            {following.length == 0 && <Text>You follow no one yet</Text>}
            {/*List of followers*/}
            {/* Display users in a list */}
            <View>
                {following.map((user, index) => (
                    <List.Item
                        title={user.name}
                        description={user.email}
                        right={props => <Button 
                            onPress={async () => {
                                try {
                                    const response = await axiosInstance.delete(`user/${user.id}/unfollow`, {
                                        headers: {
                                            Authorization: `Bearer ${await AsyncStorage.getItem('token')}`
                                        }
                                    });
                                    console.log(response.data);
                                    // update search results
                                    fetchFollowing();
                                }
                                catch (err) {
                                    console.log(err);
                                }
                            }}
                        >Unfollow</Button>}
                        onPress={() => {
                            // navigate to user profile
                            router.push({
                                pathname: '/profile/[id]',
                                params: {
                                    id: user.user.id
                                }
                            });
                        }}
                    />
                ))}
            </View>
        </SafeAreaView>
    );
}