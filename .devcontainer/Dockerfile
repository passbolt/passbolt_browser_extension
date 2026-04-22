FROM mcr.microsoft.com/devcontainers/typescript-node:22

RUN npm install -g @aikidosec/safe-chain

RUN curl -fsSL https://claude.ai/install.sh | bash -s stable \
    && cp /root/.local/bin/claude /usr/local/bin/claude

