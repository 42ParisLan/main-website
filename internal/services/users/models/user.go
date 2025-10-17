package usersmodels

import (
	"base-website/ent"
	"base-website/internal/lightmodels"
)

type User struct {
	lightmodels.LightUser
}

func NewUserFromEnt(entUser *ent.User) *User {
	return &User{
		LightUser: *lightmodels.NewLightUserFromEnt(entUser),
	}
}

func NewUsersFromEnt(entUsers []*ent.User) []*User {
	users := make([]*User, len(entUsers))
	for i, entUser := range entUsers {
		users[i] = NewUserFromEnt(entUser)
	}
	return users
}
