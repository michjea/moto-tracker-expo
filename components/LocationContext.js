import React from "react";
import { useEffect } from "react";
import * as Location from 'expo-location';
import { useSelector, useDispatch } from "react-redux";
import { fetchLocation, setLocation } from "../state/locationSlice";

const LocationContext = React.createContext();

export function useLocationContext() {
  return React.useContext(LocationContext);
}

export function LocationProvider({children}) {
    const [location, setLocation] = React.useState(null);
    const [from, setFrom] = React.useState(null);
    const [to, setTo] = React.useState(null);
    const [selectedField, setSelectedField] = React.useState('from');
    const location_ = useSelector((state) => state.location.location);
    const dispatch = useDispatch();

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
            console.log("Calling fetchLocation()");
            dispatch(fetchLocation());
        })();
    }, []);

    return (
        <LocationContext.Provider value={{ location, from, to, setSelectedField, setSelectedLocation, location_ }}>
            {children}
        </LocationContext.Provider>
    );
}