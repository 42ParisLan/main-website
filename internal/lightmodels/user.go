package lightmodels

import (
	"time"

	"base-website/ent"
	"base-website/ent/user"
)

type LightUser struct {
	ID             int       `json:"id" example:"42" description:"The ID of the user"`
	Username       string    `json:"username" example:"froz" description:"The username of the user"`
	FirstName      string    `json:"first_name" example:"Theo" description:"The first name of the user"`
	LastName       string    `json:"last_name" example:"Matis" description:"The last name of the user"`
	Email          string    `json:"email" example:"froz@42paris.fr" description:"The email of the user"`
	CreatedAt      time.Time `json:"created_at" example:"2024-01-01T00:00:00Z" description:"The creation date of the user"`
	UpdatedAt      time.Time `json:"updated_at" example:"2024-01-01T00:00:00Z" description:"The last update date of the user"`
	Picture        *string   `json:"picture" example:"https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Rick_Astley-cropped.jpg/220px-Rick_Astley-cropped.jpg" description:"The picture of the user"`
	Kind           user.Kind `json:"kind" example:"user" description:"The kind of the user" enum:"user,admin"`
	UsualFullName  string    `json:"usual_full_name" example:"Theo Matis" description:"The usual full name of the user"`
	UsualFirstName *string   `json:"usual_first_name" example:"Theo" description:"The usual first name of the user"`
	Roles          []string  `json:"roles" example:"[\"user\"]" description:"The roles of the user" nullable:"false"`
}

func NewLightUserFromEnt(entUser *ent.User) *LightUser {
	if entUser == nil {
		return nil
	}
	return &LightUser{
		ID:             entUser.ID,
		Username:       entUser.Username,
		FirstName:      entUser.FirstName,
		LastName:       entUser.LastName,
		Email:          entUser.Email,
		CreatedAt:      entUser.CreatedAt,
		UpdatedAt:      entUser.UpdatedAt,
		Picture:        entUser.Picture,
		Kind:           entUser.Kind,
		UsualFullName:  entUser.UsualFullName,
		UsualFirstName: entUser.UsualFirstName,
		Roles:          entUser.Roles,
	}
}

func NewLightUsersFromEnt(entUsers []*ent.User) []*LightUser {
	users := make([]*LightUser, len(entUsers))
	for i, entUser := range entUsers {
		users[i] = NewLightUserFromEnt(entUser)
	}
	return users
}
