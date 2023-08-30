# Run in android emulator

## Problem with API unreachable

Expo is running on address `192.168.x.x` on android emulator, but API is running on `localhost` on your computer. You need to change `localhost` to `192.168.x.x`.

- Get IP adress of your computer
  - Windows: `ipconfig`
- Run Laravel API with IP address
  - `php artisan serve --host=192.168.x.x`
- Documentation : https://mahdi-karimipour.medium.com/connecting-expo-built-mobile-apps-to-localhost-deployed-apis-8b017d42e4a4

# Other

## Problem with .env not updating

Babel is caching .env file. You need to clear cache.

- `npx expo start --clear`

- Documentation : https://www.npmjs.com/package/react-native-dotenv
