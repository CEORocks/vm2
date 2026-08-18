#!/bin/bash
ACC=$1
if [ -z "$ACC" ]; then
  echo "Usage: source switcher.sh <acc1|acc2|acc3>"
  return 1 2>/dev/null || exit 1
fi

PROFILE_DIR="$HOME/.profiles_antigravity/$ACC"
mkdir -p "$PROFILE_DIR/.gemini" "$PROFILE_DIR/.config" "$PROFILE_DIR/.local/share"

# Swap ~/.gemini link
rm -rf "$HOME/.gemini"
ln -sfn "$PROFILE_DIR/.gemini" "$HOME/.gemini"

export XDG_CONFIG_HOME="$PROFILE_DIR/.config"
export XDG_DATA_HOME="$PROFILE_DIR/.local/share"

echo "Switched to Antigravity Profile: $ACC"
