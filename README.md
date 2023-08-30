# Moto tracker app

The Swiss knife for motorcycle riders.

## Installation Docker

```bash
docker build -t expo_app .
docker run -p 19000:19000 -p 19001:19001 expo_app
```

## Installation

```bash
npm install
```

## Start

```bash
expo-cli start --tunnel # old way
npx expo start --tunnel # new way
```

## Deploy

### Web

```bash
npx expo export -p web
netlify deploy --dir dist
```
