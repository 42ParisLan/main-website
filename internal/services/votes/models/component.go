package votesmodels

type CreateComponent struct {
	Name        string `json:"name" example:"Network" description:"The name of the component" required:"true" validate:"min=3"`
	Description string `json:"description" example:"Network infrastructure and connectivity" description:"The description of the component" required:"true" validate:"min=3"`
	ImageURL    string `json:"image_url" example:"https://example.com/network.png" description:"The image URL of the component" required:"true"`
	Color       string `json:"color" example:"#FF5733" description:"The color of the component" required:"true"`
}

type UpdateComponent struct {
	Name        *string `json:"name" example:"Network" description:"The name of the component" validate:"min=3" required:"false"`
	Description *string `json:"description" example:"Network infrastructure and connectivity" description:"The description of the component" validate:"min=3" required:"false"`
	ImageURL    *string `json:"image_url" example:"https://example.com/network.png" description:"The image URL of the component" required:"false"`
	Color       *string `json:"color" example:"#FF5733" description:"The color of the component" required:"false"`
}
