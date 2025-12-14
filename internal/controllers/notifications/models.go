package notificationscontroller

import (
	"base-website/internal/lightmodels"
	"base-website/pkg/paging"
)

type notificationIDInput struct {
	NotificationID int `path:"id" required:"true" example:"42" description:"The notification ID"`
}

type NotificationsInput struct {
	Page   int    `query:"page" example:"0" description:"The page of the search" minimum:"0" default:"0"`
	Limit  int    `query:"limit" example:"10" description:"The limit of the search" maximum:"100" minimum:"1" default:"20"`
	Order  string `query:"order" example:"asc" description:"The order of the search" enum:"asc,desc" default:"desc"`
	Status string `query:"status" example:"all" description:"Filter by notification status" enum:"all,read,unread" default:"all"`
}

type BodyMessage struct {
	Body string `required:"true"`
}

type paginatedNotificationsOutput struct {
	Body *paging.Response[*lightmodels.Notification] `required:"true"`
}
