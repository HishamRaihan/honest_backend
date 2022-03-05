#!/bin/bash

API="http://localhost:4741"
URL_PATH="/jobs"

curl "${API}${URL_PATH}" \
  --include \
  --request POST \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer ${TOKEN}" \
  --data '{
    "job": {
      "title": "'"${TITLE}"'",
      "company": "'"${COMPANY}"'",
      "description": "'"${DESC}"'",
      "budget": "'"${BUDGET}"'",
      "date": "'"${DATE}"'",
    }
  }'

echo
