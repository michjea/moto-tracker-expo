// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const path = require('path');

module.exports = config;

/*config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionsByPlatform = {
    web: ['browser'],
};

config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (platform === 'web' && moduleName === 'react-native-maps') {
        return {
            filePath: path.resolve(__dirname, 'node_modules/@teovilla/react-native-maps-web'),
            type: 'sourceFile',
        };
    }
    return context.resolve(context, moduleName, platform);
};

module.exports = config;*/

/*module.exports = {
    resolver: {
        platforms: ['ios', 'android', 'web'],
        resolveRequest: (context, realModuleName, platform) => {
            // si la plateforme est web et que le module est react-native-maps, on renvoie le module @teovilla/react-native-maps-web
            if (platform === 'web' && realModuleName === 'react-native-maps') {
                return require.resolve('@teovilla/react-native-maps-web');
            }
            return require.resolve(context, realModuleName, platform);
        },
    },
};*/