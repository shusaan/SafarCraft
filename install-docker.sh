#!/usr/bin/env bash
# CareerForge-AI — Docker install wrapper
# Run once from your terminal:  bash install-docker.sh
# It will ask for your sudo password ONCE, then install everything.

set -e

echo "==> Asking for sudo password (cached for 15 min after this)..."
sudo -v

KEEPALIVE_PID=""
while true; do sudo -n true; sleep 60; kill -0 "$$" 2>/dev/null || exit; done 2>/dev/null &
KEEPALIVE_PID=$!
trap 'kill $KEEPALIVE_PID 2>/dev/null || true' EXIT

echo "==> Removing any conflicting distro packages..."
sudo apt remove -y docker.io docker-compose docker-compose-v2 docker-doc docker-buildx podman-docker containerd runc 2>/dev/null || true

echo "==> Installing prereqs + Docker GPG key..."
sudo apt update
sudo apt install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "==> Adding Docker apt repo..."
. /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu ${UBUNTU_CODENAME:-noble} stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update

echo "==> Installing Docker Engine + Compose plugin + buildx..."
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

echo "==> Enabling + starting docker service..."
sudo systemctl enable --now docker

echo "==> Adding $USER to docker group (run docker without sudo)..."
sudo usermod -aG docker "$USER"

echo "==> Versions:"
docker --version
docker compose version
docker buildx version

echo ""
echo "==> Verifying with hello-world (using sudo first since group change needs new login)..."
sudo docker run --rm hello-world

echo ""
echo "==> DONE."
echo "Log out and back in (or run:  newgrp docker) so the docker group takes effect."
echo "Then opencode can run:  docker compose up app --build"
