package lightmodels

import (
	"base-website/ent"
	s3service "base-website/internal/services/s3"
	"context"
	"time"
)

type Component struct {
	ID          int     `json:"id" example:"1" description:"The ID of the component"`
	Name        string  `json:"name" example:"Network" description:"The name of the component"`
	Description string  `json:"description" example:"Network infrastructure and connectivity" description:"The description of the component"`
	ImageURL    *string `json:"image_url" example:"https://example.com/network.png" description:"The image URL of the component"`
	Color       string  `json:"color" example:"#FF5733" description:"The color of the component"`
}

func NewComponentFromEnt(ctx context.Context, entComponent *ent.Component, S3Service s3service.S3Service) *Component {
	if entComponent == nil {
		return nil
	}

	var imageUrl *string
	if entComponent.ImageURL != nil {
		tmp, err := S3Service.PresignedGet(ctx, *entComponent.ImageURL, time.Hour)
		if err == nil {
			imageUrl = &tmp
		}
	}

	return &Component{
		ID:          entComponent.ID,
		Name:        entComponent.Name,
		Description: entComponent.Description,
		ImageURL:    imageUrl,
		Color:       entComponent.Color,
	}
}

func NewComponentsFromEnt(ctx context.Context, entComponents []*ent.Component, S3Service s3service.S3Service) []*Component {
	components := make([]*Component, len(entComponents))
	for i, entComponent := range entComponents {
		components[i] = NewComponentFromEnt(ctx, entComponent, S3Service)
	}
	return components
}
