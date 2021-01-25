# Allow certain kubernetes contexts to deploy to and avoid the "accidental prod deploy"
allow_k8s_contexts('kind-kind')

local_resource('build-chrome-ext',
                cmd='docker run -v ${PWD}:/app -v ${PWD%/*/*}/styleguide/passbolt-styleguide:/passbolt-styleguide -w /app node:14.15.4 /bin/bash -c "npm link ../passbolt-styleguide && npm install && npx grunt build-chrome-debug"')
