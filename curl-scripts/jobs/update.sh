#!/bin/bash

API="http://localhost:4741"
URL_PATH="/jobs"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request PATCH \
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
