#!/bin/bash

# Install dependencies
npm install

# Run setup script to generate .env
node setup.js

# Install code-server if not already installed
if ! command -v code-server &> /dev/null; then
    curl -fsSL https://code-server.dev/install.sh | sh
fi

# Create systemd service file
sudo tee /etc/systemd/system/code-server.service << EOF
[Unit]
Description=VS Code Server
After=network.target

[Service]
Type=simple
User=$USER
EnvironmentFile=$(pwd)/.env
ExecStart=/usr/bin/code-server --bind-addr 0.0.0.0:\${PORT}
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable code-server
sudo systemctl start code-server

# Deploy worker
npm run deploy
