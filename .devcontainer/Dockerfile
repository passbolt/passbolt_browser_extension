FROM mcr.microsoft.com/devcontainers/typescript-node:22

RUN npm install -g @aikidosec/safe-chain

RUN curl -fsSL https://claude.ai/install.sh | bash \
    && cp /root/.local/bin/claude /usr/local/bin/claude

