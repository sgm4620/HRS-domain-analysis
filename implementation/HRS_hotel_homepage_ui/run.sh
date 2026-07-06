#!/usr/bin/env bash
cd "$(dirname "$0")"
if command -v xdg-open >/dev/null 2>&1; then
  xdg-open "hotel_homepage/index.html"
elif command -v open >/dev/null 2>&1; then
  open "hotel_homepage/index.html"
else
  echo "Open hotel_homepage/index.html in your browser."
fi
