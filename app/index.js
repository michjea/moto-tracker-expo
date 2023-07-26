import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useEffect, useState } from 'react';
import { Redirect, Stack, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Index = () => {
    // Check if the user is logged in. If so, redirect to home page. Otherwise, redirect to login page.
    const router = useRouter();

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const jsonValue = await AsyncStorage.getItem('user');
                if (jsonValue != null) {
                    router.replace('/home');
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