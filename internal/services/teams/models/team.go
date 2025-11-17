package teamsmodels

import "github.com/danielgtaylor/huma/v2"

type CreateTeam struct {
	Name          string        `form:"name" example:"Team Phoenix" required:"true"`
	CreatorStatus string        `form:"creator_status" example:"Player" required:"true"`
	Image         huma.FormFile `form:"image" contentType:"image/*" description:"The uploaded image file"`
}
