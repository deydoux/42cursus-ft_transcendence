#!/bin/bash

BASE_URL="http://localhost:3000"
EXAMPLE_PASSWORD="Hello World42"

USERNAME="$1"

if [ -z "$USERNAME" ]; then
  TTY_ID=$(tty | sed -nE 's/.*[^0-9]([0-9]+)$/\1/p')
  USERNAME="$USER$TTY_ID"

  echo "Using '$USERNAME' username"
fi

ACCESS_TOKEN="$(
  curl --request POST \
    --url "$BASE_URL/api/auth/signup" \
    --header 'Content-Type: application/json' \
    --data '{
      "username": "'"$USERNAME"'",
      "password": "'"$EXAMPLE_PASSWORD"'"
    }' |
  jq -r '.accessToken'
)"

if [ "$ACCESS_TOKEN" = "null" ]; then
  ACCESS_TOKEN="$(
    curl --request POST \
      --url "$BASE_URL/api/auth/login" \
      --header 'Content-Type: application/json' \
      --data '{
        "username": "'"$USERNAME"'",
        "password": "'"$EXAMPLE_PASSWORD"'"
      }' |
    jq -r '.accessToken'
  )"
fi

DIR="$(dirname "$0")"
exec "$DIR/index.js" "$ACCESS_TOKEN"
