package intraclient

import (
	"fmt"

	intraclientmodels "base-website/pkg/intraclient/models"
)

// GetUserByLogin retrieves a user by their login.
func (c *Client) GetUserByLogin(login string) (*intraclientmodels.IntraUser, error) {
	user := &intraclientmodels.IntraUser{}
	err := c.get(fmt.Sprintf("users/%s", login), user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// GetUserById retrieves a user by their ID.
func (c *Client) GetUserById(id int) (*intraclientmodels.IntraUser, error) {
	user := &intraclientmodels.IntraUser{}
	err := c.get(fmt.Sprintf("users/%d", id), user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

// GetUserMe retrieves the current authenticated user.
func (c *Client) GetUserMe() (*intraclientmodels.IntraUser, error) {
	user := &intraclientmodels.IntraUser{}
	err := c.get("me", user)
	if err != nil {
		return nil, err
	}
	return user, nil
}
