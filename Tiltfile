# Allow certain kubernetes contexts to deploy to and avoid the "accidental prod deploy"
allow_k8s_contexts('kind-kind')

local_resource('npm-link',
                cmd='docker run -v ${PWD}:/app -v ${PWD%/*/*}/styleguide/passbolt-styleguide:/passbolt-styleguide -w /app node /bin/bash -c "npm link ../passbolt-styleguide"')
local_resource('build-chrome-ext',
                cmd='docker run -v ${PWD}:/app -v ${PWD%/*/*}/styleguide/passbolt-styleguide:/passbolt-styleguide -w /app node /bin/bash -c "npm install && npx grunt build-chrome-debug"',
                deps=['src'],
                ignore=['node_modules', 'build', 'src/all/data', 'src/all/background_page/config/config.json'])
#local_resource('build-firefox-ext',
#                cmd='docker run -v ${PWD}:/app -v ${PWD%/*/*}/styleguide/passbolt-styleguide:/passbolt-styleguide -w /app node /bin/bash -c "npx grunt build-chrome-debug"',
#                deps=['.'],
#                ignore=['node_modules', 'build', 'src/all/data'])
