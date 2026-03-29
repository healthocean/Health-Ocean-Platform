#!/bin/bash

echo "🌊 Starting Health Ocean - All Services"
echo ""

# Detect terminal emulator
if command -v gnome-terminal &> /dev/null; then
  TERM_CMD="gnome-terminal --"
elif command -v xterm &> /dev/null; then
  TERM_CMD="xterm -e"
elif command -v konsole &> /dev/null; then
  TERM_CMD="konsole -e"
else
  echo "No supported terminal emulator found (gnome-terminal, xterm, konsole)."
  exit 1
fi

ROOT=$(pwd)

launch() {
  local title="$1"
  local cmd="$2"
  echo "Launching: $title"
  if [[ "$TERM_CMD" == "gnome-terminal --" ]]; then
    gnome-terminal --title="$title" -- bash -c "$cmd; exec bash"
  else
    $TERM_CMD bash -c "$cmd; exec bash" &
  fi
}

# API
launch "Health Ocean - API" "cd '$ROOT' && bash START_API.sh"

# Web
launch "Health Ocean - Web" "cd '$ROOT' && bash START_WEB.sh"

# Admin Portal
launch "Health Ocean - Admin Portal" "cd '$ROOT' && bash START_ADMIN_PORTAL.sh"

# Lab Portal
launch "Health Ocean - Lab Portal" "cd '$ROOT' && bash START_LAB_PORTAL.sh"

# Flutter User App
launch "Health Ocean - User App" "cd '$ROOT' && bash START_USER_APP.sh"

echo ""
echo "All services launched in separate terminals."
echo ""
echo "  API          → http://https://ada5-2401-4900-7083-fd76-b652-92d9-1ad3-fb9c.ngrok-free.app"
echo "  Web          → http://localhost:3000"
echo "  Lab Portal   → http://localhost:3001"
echo "  Admin Portal → http://localhost:3002"
echo "  User App     → Flutter (connected device)"
