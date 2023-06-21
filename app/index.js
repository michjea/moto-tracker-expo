import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useState } from 'react';
import { Redirect, Stack, useRouter } from 'expo-router';

const Index = () => {
    return (
        <Redirect href="/home" />
    );
};

export default Index;