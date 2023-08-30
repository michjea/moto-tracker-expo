// Reducer for location
import { createSlice } from "@reduxjs/toolkit";
import * as Location from 'expo-location';

export const fetchLocation = () => async (dispatch, getState) => {
    console.log("Starting fetchLocation()");
    try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            console.log('Permission to access location was denied');
            return;
        }

        console.log("Getting current position...");

        let location = await Location.getCurrentPositionAsync({});
        dispatch(setLocation(location));
        console.log("Location : ", location);
        // prev distance à l'infini
        let prevDistance = Infinity;

        let subscription = await Location.watchPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 5,
        }, (location) => {
            console.log("is nav started ? ", getState().location.isNavStarted);
            console.log("new location : ", location);
            //console.log("prev location : ", getState().location.location);
            dispatch(setLocation(location));
            //console.log("Location changed : ", location);
            let routeInstructions = getState().location.routeInstructions;
            let instructionIndex = getState().location.instructionIndex;

            if (getState().location.isNavStarted) {
                let coucou = {
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        speed: location.coords.speed*3.6,
                        altitude: location.coords.altitude,
                };
                console.log("coucou : ", coucou);

                dispatch(setRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    // very zoomed in
                    latitudeDelta: 0.0022,
                    longitudeDelta: 0.0011,
                }));

                // add couocu to pathDone with setPathDone
                dispatch(pushPathDone(coucou));
                console.log("after pathdone");                

                if (instructionIndex <= routeInstructions.length - 1) {

                    //console.log("instructionIndex : ", instructionIndex);
                    //console.log("routeInstructions : ", routeInstructions);
                    //console.log("intruction : ", routeInstructions[instructionIndex]);

                let distance = Math.sqrt(Math.pow(location.coords.latitude - routeInstructions[instructionIndex][2], 2) + Math.pow(location.coords.longitude - routeInstructions[instructionIndex][3], 2));
                let distance_m = distance * 111.139;
                console.log("distance : ", distance_m);
                if (instructionIndex === 0){
                    // give instruction with meters
                    dispatch(setCurrentInstruction(routeInstructions[instructionIndex][0] + " in " + Math.floor(distance_m) + " meters"));
                    console.log("instruction " + routeInstructions[instructionIndex][0] + " in " + Math.floor(distance_m) + " meters");
                }

                if (distance_m < 10) {
                    //console.log("distance inférieure à 10 mètres");
                    dispatch(setCurrentInstruction(routeInstructions[instructionIndex][0] + " in " + Math.floor(distance_m) + " meters"));
                    //console.log("instruction " + routeInstructions[instructionIndex][0]);
                    if(prevDistance < distance_m) {
                        dispatch(incrementInstructionIndex());
                        console.log("next instruction");
                    }
                } else {
                    console.log("distance supérieure à 10 mètres");
                    // give instruction with meters
                    dispatch(setCurrentInstruction(routeInstructions[instructionIndex][0] + " in " + Math.floor(distance_m) + " meters"));
                    console.log("instruction " + routeInstructions[instructionIndex][0] + " in " + Math.floor(distance_m) + " meters");
                }
                prevDistance = distance_m;
            }
            }
        });

        return () => subscription.remove();
    } catch (e) {
        console.log(e);
        // print line of error
        console.log(e.stack.split("\n")[1]);
    }
};

export const locationSlice = createSlice({
    name: "location",
    initialState: {
        location: null,
        isNavStarted: false,
        pathDone: [],
        routeInstructions: [],
        instructionIndex: 0,
        currentInstruction: "",
        region: null,
        map: null,
    },
    reducers: {
        setLocation: (state, action) => {
            state.location = action.payload;
        },
        setNavStarted: (state, action) => {
            state.isNavStarted = action.payload;
        }, 
        setPathDone: (state, action) => {
            state.pathDone = action.payload;
        },
        pushPathDone: (state, action) => {
            state.pathDone.push(action.payload);
        },
        setRouteInstructions: (state, action) => {
            state.routeInstructions = action.payload;
            // set current instruction
            state.currentInstruction = action.payload[0][0];
        },
        incrementInstructionIndex: (state, action) => {
            state.instructionIndex += 1;
        },
        setInstructionIndex: (state, action) => {
            state.instructionIndex = action.payload;
        },
        setCurrentInstruction: (state, action) => {
            state.currentInstruction = action.payload;
        },
        setRegion: (state, action) => {
            state.region = action.payload;
        },
        setMap : (state, action) => {
            state.map = action.payload;
        }
    },
});

export const { setLocation, setNavStarted, setPathDone, pushPathDone, setRouteInstructions, incrementInstructionIndex, setInstructionIndex, setCurrentInstruction, setRegion, setMap } = locationSlice.actions;

export default locationSlice.reducer;
