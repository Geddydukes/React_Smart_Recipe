#!/bin/bash

# Source NVM and use Node.js 18
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use 18

# Set Ruby version
eval "$(rbenv init -)"
rbenv shell 3.2.2

# Clean up
rm -rf ios
rm -rf node_modules

# Install dependencies
npm install

# Create symbolic link for autolinking script
mkdir -p ios/scripts
ln -s ../node_modules/expo/scripts/autolinking ios/scripts/autolinking

# Run prebuild with community autolinking
EXPO_USE_COMMUNITY_AUTOLINKING=1 npx expo prebuild --platform ios

# Install pods
cd ios
pod install 