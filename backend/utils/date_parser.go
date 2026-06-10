package utils

import (
	"fmt"
	"strings"
	"time"
)

func ParseFlexibleDate(input string) (time.Time, error) {
	cleaned := strings.TrimSpace(input)
	if cleaned == "" {
		return time.Time{}, fmt.Errorf("empty date string payload input provided")
	}

	layouts := []string{
		time.RFC3339,
		"2006-01-02T15:04:05Z07:00",
		"2006-01-02T15:04:05",
		"2006-01-02 15:04:05",
		"2006-01-02",
		"02-01-2006",
		"02/01/2006",
	}

	for _, layout := range layouts {
		if t, err := time.Parse(layout, cleaned); err == nil {
			return t, nil
		}
	}

	return time.Time{}, fmt.Errorf("unable to parse date string '%s' using standard format patterns", input)
}
