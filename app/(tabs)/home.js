import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Searchbar } from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link, useRouter } from 'expo-router';
import { set } from 'react-native-reanimated';

const Home = () => {

    const router = useRouter();
    const [searchText, setSearchText] = useState('');

    const [posts, setPosts] = useState([]);
    const [offset, setOffset] = useState(0);
    const [message, setMessage] = useState('');

    useEffect(() => {

        async function getPosts() {
            setSearchText('');

            try {
                $result = await axios.get('https://moto-trackr.jeanne-michel.pro/api/feed', {
                    headers: {
                        Authorization: `Bearer ${await AsyncStorage.getItem('token')}`
                    }
                });

                if ($result.data.message) {
                    setMessage($result.data.message);
                    
                } else {
                    // add result.data to existing posts
                    setPosts(...posts, $result.data);
                }
            } catch (e) {
                console.log(e);
            }
        }
    }, []);

    return (
        <SafeAreaView style={{ padding: 20 }}>
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
                            <Text style={{ fontWeight: 'bold' }}>{post.user.name}</Text>
                            <Text>{post.content}</Text>
                        </View>
                    );
                })}
            </View>
            {/* Message */}
            <Text variant="headlineSmall" style={{ alignItems: 'center' }}>{message}</Text>

        </SafeAreaView>
    );
};

export default Home;