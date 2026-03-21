# Health Ocean - Phlebotomist App 🛵🩸

This is the Flutter mobile application specifically designed for Sample Collectors (Phlebotomists) working at partner laboratories under the Health Ocean platform.

## Features
- **Daily Route Management:** View all assigned patient sample collections for the day.
- **Smart Status Tracker:** Update live booking statuses (`On My Way`, `Arrived`, `Sample Collected`).
- **Google Maps Integration:** Quick jump into native maps for directions to the patient's address.
- **Collector Dashboard:** Instant summary of your completed and pending routes.

## Prerequisites
- [Flutter SDK](https://docs.flutter.dev/get-started/install) (3.19+ recommended)
- Dart SDK
- Android Studio / Xcode for device simulation
- **Configured Backend:** Ensure the Health Ocean Backend API is running on `localhost:4000` (or update base URL in `api_service.dart`)

## Quick Start
```bash
# 1. Install dependencies
flutter pub get

# 2. Run the application
flutter run
```

## Structure
- `lib/screens`: All the UI screens (Dashboard, Login, Booking Details)
- `lib/providers`: State management handling authentication and assignments via Provider
- `lib/services`: Networking and API classes pulling data from the main node backend

## Dependencies
- `provider`: State Management
- `http`: Network integration
- `url_launcher`: Navigation capability for Google Maps intent
