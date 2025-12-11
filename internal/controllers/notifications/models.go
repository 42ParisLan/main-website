package notificationscontroller

import (
	"base-website/internal/lightmodels"
)

type notificationIDInput struct {
	NotificationID int `path:"id" required:"true" example:"42" description:"The notification ID"`
}

type notificationOutput struct {
	Body *lightmodels.Notification `required:"true"`
}

type BodyMessage struct {
	Body string `required:"true"`
}

type multipleNotificationsOutput struct {
	Body []*lightmodels.Notification `required:"true"`
}
