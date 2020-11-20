set -e

cd ~/redox-ui
git pull
npm run build
reboot
