#!/usr/bin/env bash

# shellcheck disable=SC1091

set -eu

CI_SCRIPTS_DIR=$(dirname "$0")/..

# shellcheck source=.gitlab-ci/scripts/lib/version-check.sh
source "$CI_SCRIPTS_DIR"/lib/version-check.sh

function send_to_chrome() {
  local token
  token=$(curl "https://www.googleapis.com/oauth2/v4/token" -H 'Content-Type: application/json' -d "$PAYLOAD_WS" | grep access_token | awk '{print $2}' | awk -F'"' '$0=$2')
  local id="$1"
  curl \
    -H "Authorization: Bearer $token"  \
    -H "x-goog-api-version: 2" \
    -X PUT \
    -T "dist/chrome/passbolt-${CI_COMMIT_TAG#v}.zip" \
    https://www.googleapis.com/upload/chromewebstore/v1.1/items/"$id"
}

if is_release_candidate "$CI_COMMIT_TAG"; then
  case $1 in
    chrome)
      send_to_chrome "$PASSBOLT_TESTING_CHROME_ID"
    ;;
    firefox)
      echo "We don't send RC for firefox to review"
    ;;
    edge)
      echo "We don't send RC for edge to review"
    ;;
    *) echo "I don't recognize this option"
    ;;
  esac
else
  case $1 in
    chrome)
      send_to_chrome "$PASSBOLT_STABLE_CHROME_ID"
    ;;
    firefox)
      echo "We don't send RC for firefox to review"
    ;;
    edge)
      echo "We don't send RC for edge to review"
    ;;
    *) echo "I don't recognize this option"
    ;;
  esac
fi