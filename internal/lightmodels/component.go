package lightmodels

import "base-website/ent"

type Component struct {
	ID          int    `json:"id" example:"1" description:"The ID of the component"`
	Name        string `json:"name" example:"Network" description:"The name of the component"`
	Description string `json:"description" example:"Network infrastructure and connectivity" description:"The description of the component"`
	ImageURL    string `json:"image_url" example:"https://example.com/network.png" description:"The image URL of the component"`
	Color       string `json:"color" example:"#FF5733" description:"The color of the component"`
}

func NewComponentFromEnt(entComponent *ent.Component) *Component {
	if entComponent == nil {
		return nil
	}
	return &Component{
		ID:          entComponent.ID,
		Name:        entComponent.Name,
		Description: entComponent.Description,
		ImageURL:    entComponent.ImageURL,
		Color:       entComponent.Color,
	}
}

func NewComponentsFromEnt(entComponents []*ent.Component) []*Component {
	components := make([]*Component, len(entComponents))
	for i, entComponent := range entComponents {
		components[i] = NewComponentFromEnt(entComponent)
	}
	return components
}
