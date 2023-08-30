import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useEffect, useState } from 'react';
import { Redirect, Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import axiosInstance from '../components/axiosConfig';

const Index = () => {
    // Check if the user is logged in. If so, redirect to home page. Otherwise, redirect to login page.
    const router = useRouter();

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('user');

                if (jsonValue != null) {
                    
                    try {
                        // Try to get user from database
                        const response = await axiosInstance.get('user/account', {
                            headers: {
                                // add token to header
                                Authorization: `Bearer ${await AsyncStorage.getItem('token')}`
                            }
                        });
                        
                        console.log("User is logged in. Redirecting to home page...");
                        //console.log(response.data);

                        router.replace('/home');
                    } catch (e) {
                        console.log('Error while fetching user from database');
                        console.log(e);
                        console.log('Redirecting to login page');
                        router.replace('/auth/login');
                    }
                } else {
                        router.replace('/auth/login');
                }
                
            } catch (e) {
                console.log('Error while fetching user from asyncStorage');
                console.log(e);
            }
        };
        checkLogin();
    }, []);

    return (
        <SafeAreaView>
            {/*<Redirect href="/home" />*/}
            <ScrollView>
                <Text>Index</Text>
            </ScrollView>
        </SafeAreaView>
    );
};

export default Index;