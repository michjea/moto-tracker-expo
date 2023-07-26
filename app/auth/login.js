import { Component, useState } from 'react';
import { View, Platform } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from 'react';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { Link, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [errors, setErrors] = useState({});

    const router = useRouter();

    return (
        <SafeAreaView style={{ padding: 50 }}>
            <Text variant='headlineMedium'>Login</Text>

            <HelperText type="error" visible={errors.general}>
                {errors.general}
            </HelperText>

            <View style={{ height: 20 }} />

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                error={errors.email}
            />
            <HelperText type="error" visible={errors.email}>
                {errors.email}
            </HelperText>

            {/* Add space between email and password */}
            <View style={{ height: 20 }} />

            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                error={errors.password}
                secureTextEntry={true}
            />
            <HelperText type="error" visible={errors.password}>
                {errors.password}
            </HelperText>

            <View style={{ height: 20 }} />

            <Button
                mode="contained"
                onPress={async () => {
                    let device_name = Platform.OS;

                    try {
                        /*let result = await axios.post('https://moto-tracker-user-api.jeanne-michel.pro/api/login', {
                            email,
                            password,
                            device_name
                        });*/

                        let result = await axios.post('https://moto-trackr.jeanne-michel.pro/api/auth/login', {
                            email,
                            password,
                            device_name
                        }, {
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        });

                        console.log(result);

                        // Store the user in the async storage
                        await AsyncStorage.setItem('user', JSON.stringify(result.data.user));

                        // Store the token in the async storage
                        await AsyncStorage.setItem('token', result.data.token);

                        // Redirect to the home page
                        router.replace('/home');
                    }
                    catch (e) {
                        if (e.response.status == 422) {
                            setErrors(e.response.data.errors);
                        } else if (e.response.status == 401) {
                            setErrors({ general: e.response.data.message });
                        }
                    }
                }}
            >Login</Button>
            <View style={{ height: 20 }} />
            {/*<Button
                mode="text"
                onPress={() => {
                    console.log('Forgot password');
                }}
            >Forgot password ?</Button>*/}

            {/* Sign up link */}
            <View style={{ height: 20 }} />
            {/*Center the text*/}
            <Text style={{ textAlign: 'center' }}>Don't have an account ? 
            <Link href="/auth/register">
                <Text style={{ color: '#c62828', fontWeight: 'bold' }}> Sign up</Text>
            </Link>
            </Text>
        </SafeAreaView>
    );
}

export default Login;