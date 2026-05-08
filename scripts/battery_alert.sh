#!/bin/bash

# Export PATH so launchd can find node and openclaw
export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"

# Get battery info on macOS
BATT_INFO=$(pmset -g batt)

# Check if it's discharging (running on battery)
if [[ "$BATT_INFO" == *"discharging"* ]]; then
    # Extract percentage and remaining time
    PERCENTAGE=$(echo "$BATT_INFO" | grep -oE '[0-9]+%' | tr -d '%')
    REMAINING=$(echo "$BATT_INFO" | grep -oE '[0-9]+:[0-9]+ remaining' | awk '{print $1}')
    
    if [ -z "$REMAINING" ]; then
        TIME_TEXT="an unknown amount of time"
    else
        TIME_TEXT="$REMAINING (HH:MM)"
    fi

    # Only alert if below 10%
    if [[ -n "$PERCENTAGE" ]] && [ "$PERCENTAGE" -le 10 ]; then
        /opt/homebrew/bin/openclaw message send --channel telegram --target "YOUR_PHONE_NUMBER_HERE" --message "⚠️ Battery Alert: Your MacBook is at $PERCENTAGE% with approximately $TIME_TEXT remaining before it shuts down. Please plug in the charger immediately to keep your J.A.R.V.I.S. automation running!"
    fi
fi
