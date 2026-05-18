# Force the safe-chain shims dir to the FRONT of PATH on every shell start.
# VS Code's remote terminal layer can re-prepend nvm / npm-global after the
# Dockerfile's ENV PATH ran, which would otherwise push the shims behind
# corepack-managed pnpm/yarn under /usr/local/share/npm-global/bin.
if [ -d "$HOME/.safe-chain/shims" ]; then
    _sc_shims="$HOME/.safe-chain/shims"
    PATH=$(printf ':%s:' "$PATH" | sed -e "s|:$_sc_shims:|:|g" -e 's|^:||' -e 's|:$||')
    export PATH="$_sc_shims:$PATH"
    unset _sc_shims
fi
