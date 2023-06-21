import React from 'react';
import { View, Text } from 'react-native';
import MapView from 'react-native-maps';
import { useState } from 'react';
import { UrlTile } from 'react-native-maps';
import { Dimensions } from 'react-native';

const Map = () => {

    const [region, setRegion] = useState({
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

    return (

            <MapView
                //minHeight={height}
                style={{ flex: 1 }}
                region={region}
                //onRegionChange={region => setRegion(region)}
            >
                <UrlTile
                    urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maximumZ={19}
                    flipY={false}
                />
            </MapView>
    );
};

export default Map;