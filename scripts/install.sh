#!/bin/bash
set -e
# MAIN APP INSTALLATION
npm i
npm run build

# MAIN APP AUTOSTART
echo '/home/pi/redox-ui/dist/linux-arm7l-unpacked/redox-ui' > ~/.xinitrc
chmod +x ~/.xinitrc
