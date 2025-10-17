package intraclient

import (
	"encoding/json"
	"fmt"

	intraclientmodels "base-website/pkg/intraclient/models"
)

// GetClosesByUserID is a function to list all close of a user
func (c *Client) GetClosesByUserID(userID int) ([]intraclientmodels.Close, error) {
	var closes []intraclientmodels.Close

	params := map[string]string{}

	result, err := c.pages(fmt.Sprintf("users/%d/closes", userID), params)
	if err != nil {
		return nil, err
	}

	for _, raw := range result {
		var close intraclientmodels.Close
		if err := json.Unmarshal(raw, &close); err != nil {
			return nil, fmt.Errorf("failed to unmarshal internship: %w", err)
		}
		closes = append(closes, close)
	}

	return closes, nil
}

// UnClosesByID is a function to unclose a close
func (c *Client) UnClosesByID(closeID int) error {
	err := c.put(fmt.Sprintf("closes/%d/unclose", closeID), &struct{}{}, &struct{}{})
	if err != nil {
		return err
	}

	return nil
}
