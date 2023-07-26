// make interceptor for axios for unauthorized requests and no internet connection and 404

import axios from 'axios';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';

axios.interceptors.response.use(
    (response) => {
        return response;
    }
    , (error) => {
        const { status } = error.response;
        
        const router = useRouter();

        if (status === 401) {
            Alert.alert(
                "Unauthorized",
                "You are not authorized to perform this action. Please log in again.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            router.push('/auth/login');
                        }
                    }
                ]
            );
        }
        else if (status === 404) {
            Alert.alert(
                "Not found",
                "The requested resource was not found.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            router.back();
                        }
                    }
                ]
            );
        }
        else if (netInfo.isConnected === false) {
            Alert.alert(
                "No internet connection",
                "Please check your internet connection.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            router.back();
                        }
                    }
                ]
            );
        }
        else {
            Alert.alert(
                "Error",
                "An error occurred. Please try again later.",
                [
                    {
                        text: "OK",
                        onPress: () => {
                            router.back();
                        }
                    }
                ]
            );
        }
        return Promise.reject(error);
    }
);
