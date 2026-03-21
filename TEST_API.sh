#!/bin/bash

echo "🧪 Testing Health Ocean API..."
echo ""

API_URL="http://localhost:4000"

# Test health check
echo "1. Testing health check..."
curl -s $API_URL/health | jq '.'
echo ""

# Test user registration
echo "2. Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@healthocean.com",
    "phone": "9876543210",
    "password": "test123"
  }')
echo $REGISTER_RESPONSE | jq '.'
TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.token')
echo ""

# Test user login
echo "3. Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@healthocean.com",
    "password": "test123"
  }')
echo $LOGIN_RESPONSE | jq '.'
echo ""

# Test get profile
echo "4. Testing get profile (with auth)..."
curl -s $API_URL/api/users/profile \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test get tests
echo "5. Testing get tests..."
curl -s $API_URL/api/tests | jq '.tests | length'
echo " tests found"
echo ""

# Test create booking
echo "6. Testing create booking..."
curl -s -X POST $API_URL/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@healthocean.com",
    "phone": "9876543210",
    "address": "123 Test Street",
    "city": "Mumbai",
    "pincode": "400001",
    "date": "2026-03-20",
    "timeSlot": "10:00 AM - 12:00 PM",
    "testIds": ["1", "2"]
  }' | jq '.'
echo ""

echo "✅ API tests completed!"
