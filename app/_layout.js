import { Stack } from "expo-router";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { LocationProvider } from "../components/LocationContext";

const theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        // Primary color is a medium red.
        primary: '#c62828',
        // Accent color is a light red.
        accent: '#ff5f52',
        // Secondary color is a dark red.
        secondary: '#8e0000',
    },
};

const Layout = () => {
    return (
        <PaperProvider theme={theme}>
            <LocationProvider>
        <Stack>
            <Stack.Screen name="(tabs)" options={{headerShown:false}} />
        </Stack>
            </LocationProvider>
        </PaperProvider>
    );
};

export default Layout;
