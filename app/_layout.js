import { Stack } from "expo-router";
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { LocationProvider } from "../components/LocationContext";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store from "../state/store";

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
        <Provider store={store}>
            <LocationProvider>
                <PaperProvider theme={theme}>
                    
                <Stack>
                    <Stack.Screen name="(tabs)" options={{headerShown:false}} />
                </Stack>
                    
                </PaperProvider>
                </LocationProvider>
        </Provider>
    );
};

export default Layout;
