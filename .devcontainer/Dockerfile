FROM node:18.17.1

SHELL ["/bin/bash", "-c"]

RUN apt update && apt install -y \
    && apt clean \
    && rm -rf /var/lib/apt/lists/*

ARG USERNAME=vscode
WORKDIR /home/$USERNAME/
