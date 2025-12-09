# MichaelPlace B&S Mobile (React Native + Expo)

Expo app for MichaelPlace B&S: login/register (Facebook-like style), product feed, sell, cart/checkout, chat, and admin users list.

## Prereqs
- Node 18+
- Expo CLI (`npm i -g expo`)
- Android Studio (Android Emulator) or Xcode (iOS Simulator) or Expo Go app on your phone

## Setup
```powershell
cd "c:\Users\Saigan\Documents\test-softwae dev\BuyAndSell\mobile"
npm install
```

Set API base URL (defaults to `http://127.0.0.1:8000/api`). If running backend on a different host (e.g., your PC IP for device testing), edit `src/api/config.ts` or set env `API_BASE_URL`.

## Run
```powershell
npm run start
# then press 'a' for Android, 'i' for iOS, or scan QR with Expo Go
```

## Screens
- Login / Register – blue header and clean card layout
- Home – shows all available products posted by users
- Product Detail – add to cart, chat with seller
- Sell – create a product
- Cart – view/edit items, checkout to create order
- Chat – direct messages per partner/product
- Users (admin only) – list all users; tap to view their selling items

## Notes
- The app stores JWT in memory and AsyncStorage. If you want auto-restore at startup, add an effect in `AuthContext` to read from AsyncStorage.
- If you need images, for simplicity we use `image_url` instead of uploads. You can extend to image picker + backend storage later.
