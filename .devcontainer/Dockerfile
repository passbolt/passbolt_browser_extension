FROM mcr.microsoft.com/devcontainers/typescript-node:22

RUN npm install -g @aikidosec/safe-chain \
 && install -d -o node -g node /home/node/.safe-chain \
 && su node -c "safe-chain setup-ci"
COPY --chown=node:node safe-chain-config.json /home/node/.safe-chain/config.json
COPY safe-chain-shims.sh /etc/profile.d/safe-chain-shims.sh
RUN chmod 0644 /etc/profile.d/safe-chain-shims.sh \
 && printf '\n# Force safe-chain shims to front of PATH for non-login shells\n[ -f /etc/profile.d/safe-chain-shims.sh ] && . /etc/profile.d/safe-chain-shims.sh\n' \
    >> /etc/bash.bashrc
ENV PATH="/home/node/.safe-chain/shims:${PATH}"

RUN curl -fsSL https://claude.ai/install.sh | bash -s stable \
    && cp /root/.local/bin/claude /usr/local/bin/claude

