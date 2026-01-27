#!/bin/bash
cd "$(dirname "$0")/../.."
export $(grep -v '^#' .env | xargs)
cd apps/api
node dist/apps/api/src/main.js
