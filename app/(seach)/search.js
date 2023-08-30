import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Searchbar, List, Button } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axiosInstance from '../../components/axiosConfig';

export default () => {

    // Extract query parameter from url
    const router = useRouter();
    const params = useLocalSearchParams();
    const { q } = params;

    const [searchQuery, setSearchQuery] = useState(q);
    const [searchResults, setSearchResults] = useState([]);

    //const url = 'https://moto-trackr.jeanne-michel.pro/api/';
    //const url = 'http://localhost:8000/api/';

    const getSearchResults = async (query) => {
        console.log("Query: " + query);
        try {
            if (query == '') {
                return;
            }
            const response = await axiosInstance.get(`users/search?query=${query}`, {
                headers: {
                    // add token to header
                    Authorization: `Bearer ${await AsyncStorage.getItem('token')}`
                }
            });

            console.log(response);
            setSearchResults(response.data);
            console.log(searchResults);
        }
        catch (err) {
            console.log("Error: " + err);
            console.log(err);
        }
    };

    useEffect(() => {
        console.log("Search query: " + searchQuery);
        getSearchResults(searchQuery);
    }, []);

    return (
        <SafeAreaView style={{ padding: 20 }}>
            {/* Search users bar */}
            <Searchbar
                style={{ backgroundColor: 'white' }}
                placeholder="Search for friends"
                value={searchQuery}
                onChangeText={(query) => {
                    console.log(query);
                    setSearchQuery(query);
                    // make get query on localhost:5000/users/search?query={query}
                    getSearchResults(query);
                }}
            />

            {/* Display users in a list */}
            <View>
                {searchResults.map((user, index) => (
                    <List.Item
                        title={user.user.name}
                        description={user.user.email}
                        right={props => <Button 
                            onPress={async () => {
                                // follow/unfollow user
                                let verb = user.following ? 'DELETE' : 'POST';
                                let url_ = '';
                                console.log(user.user.id);
                                if (user.following) {
                                    url_ = `user/${user.user.id}/unfollow`;
                                } else {
                                    url_ = `user/${user.user.id}/follow`;
                                }
                                try {
                                    const response = await axiosInstance({
                                        method: verb,
                                        url: url_,
                                        headers: {
                                            Authorization: `Bearer ${await AsyncStorage.getItem('token')}`
                                        }
                                    });
                                    console.log(response.data);
                                    // update search results
                                    getSearchResults(searchQuery);
                                }
                                catch (err) {
                                    console.log(err);
                                }
                            }}
                        >{user.following ? 'Unfollow' : 'Follow'}</Button>}
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
};

//export default Home;