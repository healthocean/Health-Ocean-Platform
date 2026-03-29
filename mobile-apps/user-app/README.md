# Health Ocean - Patient Mobile App 🌊📱

The official Health Ocean cross-platform mobile application giving patients full control over their health bookings. Built entirely on Flutter using Provider.

## Main Features
- **Body Map Interface**: Point-and-click visually intuitive search filter based on human body zones.
- **Booking Hub**: Instant access to ongoing, past, and upcoming diagnostic tests.
- **Search Capabilities**: Find global standard and specialized packages visually directly from the app.
- **Cart Sync**: Robust mobile cart logic perfectly syncing item limits and costs locally.
- **Integrated Auth**: Seamless token-based workflow to tie patient accounts between Web & App ecosystems.

## Installation
Ensure Flutter is set up properly locally alongside an Android SDK or Xcode build.
The Health Ocean backend API must be active and broadcasting locally (e.g. `https://ada5-2401-4900-7083-fd76-b652-92d9-1ad3-fb9c.ngrok-free.app`) or via an external domain updated in the `api_service.dart`.

```bash
# 1. Ensure connectivity & package hydration
flutter pub get

# 2. Fire up the simulator or connected device
flutter run
```

## Structure
- `lib/screens/`: Independent widget pages (Packages, Screen, Cart, Body Maps)
- `lib/widgets/`: Core reusable components (Test Cards, Package Cards)
- `lib/providers/`: Global app state for Auth and Cart
- `lib/services/`: Direct connectivity routes to the Health Ocean Node.js Backend 

## Packages
- `provider`
- `http`
- `shared_preferences`
