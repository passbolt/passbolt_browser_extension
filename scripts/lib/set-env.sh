# This function parses a tag in the form of:
# v3.11.0-rc.1
#
# All of the fields are mandatory:
# Version: v3.11.0-rc.1|v3.11.0
#
# It also provides the component based on if it is RC: testing|stable
function parse_tag() {
  local tag=$1

  if is_release_candidate "$tag"; then
    echo "$tag" | awk -F '-' '{print $1"-"$2,"testing"}'
  else
    echo "$tag" | awk -F '-' '{print $1,"stable"}'
  fi
}

function calculate_regex() {
  local message="$1"
  local default_value="$2"
  local pattern="$3"

  result="$(echo "$message" | sed -nE "s/.*\[.*($pattern: *)([^]|^ |^,]+).*\]/\\2/p")"
  echo "${result:-$default_value}"
}