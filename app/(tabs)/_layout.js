import { Tabs } from "expo-router"

export default () => {
    return (
        <Tabs>
            <Tabs.Screen name="home" />
            <Tabs.Screen name="map" />
            <Tabs.Screen name="account" />
        </Tabs>
    );
};