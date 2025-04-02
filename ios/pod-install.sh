#!/bin/bash

# Source NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node.js 18
nvm use 18

# Set Ruby version
eval "$(rbenv init -)"
rbenv shell 3.2.2

# Run pod install
pod install 