set -e

# MAIN APP INSTALLATION
npm i
npm run build

# MAIN APP AUTOSTART
echo '~/redox-ui/dist/linux-armv7l-unpacked/redox-ui' > ~/.xinitrc
chmod +x ~/.xinitrc
