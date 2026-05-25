# CeylonTrail Mobile App 🌍📱

CeylonTrail is a comprehensive travel and vehicle booking management mobile application built with **React Native** and **Expo**. It allows users to explore destinations, book drivers, manage their itineraries, and handle transactions—all from a beautifully designed mobile interface.

## 🚀 Features
- **User Authentication:** Secure login and registration using JWT tokens.
- **Destinations & Tours:** Browse and explore top travel destinations.
- **Driver Booking:** Find and book reliable drivers for your trips.
- **Finance & Transactions:** Manage your bookings and payments securely.
- **Reviews & Ratings:** Leave reviews for your travel experiences.
- **Role-based Access:** Includes a built-in admin dashboard for super admins to manage the entire platform.

## 🛠️ Tech Stack
- **Framework:** [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (SDK 54)
- **Navigation:** React Navigation (Stack & Bottom Tabs)
- **State Management:** React Context API
- **Local Storage:** AsyncStorage (for session persistence)
- **API Client:** Axios
- **Backend Communication:** Connects to a Node.js/Express API with a MongoDB database.

---

## ⚙️ Prerequisites
Before running the app, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) or yarn
- **Expo Go** app installed on your physical device (Android/iOS)

---

## 🏃‍♂️ Getting Started

### 1. Clone the repository and install dependencies
Navigate into the `TravelApp` (CeylonTrail) directory and install the required npm packages:
```bash
cd TravelApp
npm install
```

### 2. Configure the Backend Connection
The app needs to communicate with the backend server. You must update your local IP address in the Axios configuration file.

1. Find your computer's local IP address:
   - **Windows:** Run `ipconfig` in Command Prompt.
   - **Mac/Linux:** Run `ifconfig` in Terminal.
2. Open `src/api/axiosConfig.js`.
3. Update the `BASE_URL` variable with your IP address:
```javascript
const BASE_URL = "http://YOUR_LOCAL_IP:5000"; // Example: http://192.168.8.123:5000
```
> **Note:** Do NOT use `localhost` if you are testing on a physical device, as the phone will look for the server on itself instead of your computer.

### 3. Run the Backend Server
Make sure your backend server (`travel-app-backend`) is running simultaneously on port `5000`:
```bash
cd travel-app-backend
npm run dev
```

### 4. Start the Expo App
Run the following command to start the Metro Bundler:
```bash
npx expo start --lan
```
*If you are on the exact same Wi-Fi network as your computer, `--lan` is the most reliable way to connect.*

### 5. Open the App on your Device
- **Android:** Open the **Expo Go** app and scan the QR code displayed in your terminal.
- **iOS:** Open the default **Camera** app, scan the QR code, and tap the prompt to open Expo Go.

---

## 🔐 Super Admin Credentials
To access the admin features of the app, you can use the default super admin credentials (ensure the backend seeder script has been run):
- **Email:** `superadmin@travelapp.com`
- **Password:** `Admin@123456`

---

## 🛑 Troubleshooting

- **App fails to connect to the backend (Network Error / Invalid Credentials):**
  - Ensure your phone and computer are on the **exact same Wi-Fi network**.
  - Check that the IP address in `src/api/axiosConfig.js` matches your computer's current IP.
  - Verify that Windows Firewall is not blocking port `5000`. Set your Wi-Fi connection profile to "Private" in Windows Settings.
- **Expo tunnel fails to start:**
  - If `npx expo start --tunnel` fails, the ngrok service might be down. Use `npx expo start --lan` instead.

---
*Developed for CeylonTrail* 🐘🇱🇰
