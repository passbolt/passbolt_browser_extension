#!/usr/bin/env bash

# shellcheck disable=SC1091

set -eu

CI_SCRIPTS_DIR=$(dirname "$0")/..

# shellcheck source=.gitlab-ci/scripts/lib/version-check.sh
source "$CI_SCRIPTS_DIR"/lib/version-check.sh

if is_release_candidate "$CI_COMMIT_TAG"; then
  npm publish --tag next
elif is_release_alpha "$CI_COMMIT_TAG"; then
  npm publish --tag alpha
elif is_release_beta "$CI_COMMIT_TAG"; then
  npm publish --tag beta
elif is_stable "$CI_COMMIT_TAG"; then
  npm publish
else
   echo "The tag format is not supported"
fi