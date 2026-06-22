#!/bin/bash

# Navigate to the target directory
cd /home/site/wwwroot/ || { echo "Failed to change directory"; exit 1; }

# Remove hostingstart.html if it exists
rm -f hostingstart.html

# Update package list
apt update

# Install git if not already installed
apt install git -y

# Clone the repository (replace <your_repo_link> with your actual link)
git clone https://github.com/AKASHGK006/NodeFrontend.git

# Move all files from NodeFrontend to wwwroot
cp -r NodeFrontend/* .

# Remove the cloned NodeFrontend directory
rm -rf NodeFrontend

# Navigate to the NodeFrontend directory (if needed)
# cd NodeFrontend (not needed if files are moved to current directory)

# Install Node.js dependencies
npm install

# Start the server with PM2
pm2 start server.js --name NodeFrontend

# Save PM2 process list to resurrect on reboot
pm2 save

chmod +x script.sh

./script.sh