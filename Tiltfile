# Allow certain kubernetes contexts to deploy to and avoid the "accidental prod deploy"
allow_k8s_contexts('kind-kind')

local_resource('build-ext',
               cmd='docker run --user $UID:$GID -v ${PWD}:/app -w /app node /bin/bash -c "npm install && node_modules/grunt/bin/grunt"',
               deps=['.'], ignore=['dist', 'package.json', 'package-lock.json', 'node_modules', 'build', 'src/all/data'])
