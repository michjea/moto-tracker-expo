import React from "react";
import { useEffect } from "react";
import * as Location from 'expo-location';

const LocationContext = React.createContext();

export function useLocationContext() {
  return React.useContext(LocationContext);
}

export function LocationProvider({children}) {
    //const [selectedLocation, setSelectedLocation] = React.useState('');
    const [location, setLocation] = React.useState(null);
    const [from, setFrom] = React.useState(null);
    const [to, setTo] = React.useState(null);
    const [selectedField, setSelectedField] = React.useState('from');

    const setSelectedLocation = (location) => {
        if (selectedField == 'from') {
            setFrom(location);
        }
        else if (selectedField == 'to') {
            setTo(location);
        }
    };

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            setLocation(location);

            await Location.watchPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation,
                distanceInterval: 1,
            }, (location) => {
                setLocation(location);
                console.log("Location changed : ", location);
            });
        })();
    }, []);

    return (
        <LocationContext.Provider value={{ location, from, to, setSelectedField, setSelectedLocation }}>
            {children}
        </LocationContext.Provider>
    );
}