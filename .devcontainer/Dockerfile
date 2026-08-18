FROM mcr.microsoft.com/devcontainers/typescript-node:22@sha256:4f634c449931ac2aff140f9fac5825413196e631ccc0eb7afd17033144253be4

RUN npm install -g @aikidosec/safe-chain \
 && install -d -o node -g node /home/node/.safe-chain \
 && su node -c "safe-chain setup-ci"
COPY --chown=node:node safe-chain-config.json /home/node/.safe-chain/config.json
COPY safe-chain-shims.sh /etc/profile.d/safe-chain-shims.sh
RUN chmod 0644 /etc/profile.d/safe-chain-shims.sh \
 && printf '\n# Force safe-chain shims to front of PATH for non-login shells\n[ -f /etc/profile.d/safe-chain-shims.sh ] && . /etc/profile.d/safe-chain-shims.sh\n' \
    >> /etc/bash.bashrc
ENV PATH="/home/node/.safe-chain/shims:${PATH}"

# Install Claude Code CLI by downloading the release binary directly and verifying it
# against Anthropic's GPG-signed manifest — no remote install script is ever executed.
# Bump CLAUDE_VERSION to upgrade (>= 2.1.89 required for signed manifests).
# Key fingerprint + manifest scheme: https://code.claude.com/docs/en/setup#binary-integrity-and-code-signing
# The per-version binary URL ("$base/$CLAUDE_VERSION/$platform/claude") is the path the
# official installer uses to fetch the binary (de-facto stable; not formally documented).
ARG CLAUDE_VERSION=2.1.176
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates curl gnupg jq; \
    rm -rf /var/lib/apt/lists/*; \
    case "$(dpkg --print-architecture)" in \
      amd64) platform=linux-x64 ;; \
      arm64) platform=linux-arm64 ;; \
      *) echo "Unsupported architecture" >&2; exit 1 ;; \
    esac; \
    export GNUPGHOME="$(mktemp -d)"; \
    curl -fsSL https://downloads.claude.ai/keys/claude-code.asc | gpg --batch --import; \
    gpg --batch --fingerprint security@anthropic.com \
      | grep -q '31DD DE24 DDFA B679 F42D  7BD2 BAA9 29FF 1A7E CACE'; \
    base=https://downloads.claude.ai/claude-code-releases; \
    curl -fsSL "$base/$CLAUDE_VERSION/manifest.json"     -o /tmp/manifest.json; \
    curl -fsSL "$base/$CLAUDE_VERSION/manifest.json.sig" -o /tmp/manifest.json.sig; \
    gpg --batch --verify /tmp/manifest.json.sig /tmp/manifest.json; \
    expected="$(jq -r ".platforms[\"$platform\"].checksum" /tmp/manifest.json)"; \
    curl -fsSL "$base/$CLAUDE_VERSION/$platform/claude" -o /tmp/claude; \
    echo "$expected  /tmp/claude" | sha256sum -c -; \
    install -d -o node -g node /home/node/.local/bin; \
    install -o node -g node -m 0755 /tmp/claude /home/node/.local/bin/claude; \
    gpgconf --kill all; \
    rm -rf "$GNUPGHOME" /tmp/manifest.json /tmp/manifest.json.sig /tmp/claude; \
    /home/node/.local/bin/claude --version
ENV PATH="/home/node/.local/bin:${PATH}"
