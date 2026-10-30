#!/bin/bash
cd "$(dirname "$0")"
echo "=========================================================="
echo " Starting Shreyansh Modi's AI/ML Engineer Portfolio"
echo " URL: http://localhost:8080"
echo "=========================================================="
open "http://localhost:8080"
python3 -m http.server 8080
