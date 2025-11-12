package votesmodels

import (
	"github.com/danielgtaylor/huma/v2"
)

type CreateComponent struct {
	Name        string        `form:"name" example:"Network" description:"The name of the component" required:"true" validate:"min=3"`
	Description string        `form:"description" example:"Network infrastructure and connectivity" description:"The description of the component" required:"true" validate:"min=3"`
	Color       string        `form:"color" example:"#FF5733" description:"The color of the component" required:"true"`
	Image       huma.FormFile `form:"image" contentType:"image/*" description:"The uploaded image file" required:"true"`
}

type UpdateComponent struct {
	Name        string        `form:"name" example:"Network" description:"The name of the component"`
	Description string        `form:"description" example:"Network infrastructure and connectivity" description:"The description of the component"`
	Color       string        `form:"color" example:"#FF5733" description:"The color of the component"`
	Image       huma.FormFile `form:"image" contentType:"image/*" description:"The uploaded image file"`
}
