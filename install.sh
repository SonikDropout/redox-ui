# MAIN APP INSTALLATION
npm i &&
npm run build &&

# MAIN APP AUTOSTART
sudo mkdir /usr/share/redox
sudo cp -rf dist/linux-armv7l-unpacked/** /usr/share/redox/
echo '/usr/share/redox/redox-ui' > ~/.xinitrc
chmod +x ~/.xinitrc

while read p; do sudo systemctl disable "$p"; done < unused-packages.list
