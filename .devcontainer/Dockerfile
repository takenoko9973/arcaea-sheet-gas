FROM node:18.20-bullseye-slim

RUN apt-get update; \
    apt-get install -y \
        git \
        ; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*;
