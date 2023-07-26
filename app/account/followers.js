import axios from "axios";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text, TextInput, Button, HelperText } from "react-native-paper";
import { View } from "react-native";
import { useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default () => {

    const [followers, setFollowers] = useState([]);

    // Get user followers
    const fetchFollowers = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/api/user/followers", {
                headers: {
                    Authorization: `Bearer ${await AsyncStorage.getItem('token')}`
                }
            });
        
            setFollowers(response.data);
        }
        catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchFollowers();
    }, []);

    return (
        <SafeAreaView>
            {/*Message if no followers*/}
            {followers.length == 0 && <Text>You have no followers</Text>}
            {/*List of followers*/}
            {/* Display users in a list */}
            <View>
                {followers.map((user, index) => (
                    <List.Item
                        title={user.name}
                        description={user.email}
                    />
                ))}
            </View>
        </SafeAreaView>
    );
}