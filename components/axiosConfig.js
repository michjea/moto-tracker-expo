import axios from 'axios';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { EXPO_PUBLIC_BASE_URL } from '@env';

// Load base url from .env file
//const baseURL = process.env.EXPO_PUBLIC_BASE_URL
const baseURL = EXPO_PUBLIC_BASE_URL

console.log("baseURL: " + baseURL);

const axiosInstance = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

axiosInstance.interceptors.response.use(function(response) {
    return response;
}, function (error) {
    // if 401 response returned, redirect to login page
    if (error.response.status === 401) {
        console.log("Unauthorized 401 interceptor");
        Alert.alert(
            "Unauthorized",
            "You are not authorized to perform this action. Please log in again.",
            [
                {
                    text: "OK",
                    onPress: () => {
                        router.replace('/auth/login');
                    }
                }
            ]
        );
    }

    return Promise.reject(error);
});

export default axiosInstance;