package notificationscontroller

import (
	"base-website/internal/lightmodels"
	"base-website/internal/security"
	notificationsservice "base-website/internal/services/notifications"
	pubsubservice "base-website/internal/services/pubsub"
	"context"
	"encoding/json"
	"fmt"

	"github.com/danielgtaylor/huma/v2"
	"github.com/danielgtaylor/huma/v2/sse"
	"github.com/samber/do"
)

type notificationController struct {
	notificationsService notificationsservice.NotificationsService
	pubsubService        pubsubservice.PubSubService
}

func Init(api huma.API, injector *do.Injector) {
	controller := &notificationController{
		notificationsService: do.MustInvoke[notificationsservice.NotificationsService](injector),
		pubsubService:        do.MustInvoke[pubsubservice.PubSubService](injector),
	}
	controller.Register(api)
}

func (ctrl *notificationController) Register(api huma.API) {
	sse.Register(api, huma.Operation{
		Method:      "GET",
		Path:        "/me/notifications",
		Summary:     "Live notifications stream",
		Description: `Server-Sent Events stream that sends live notifications in real-time. Streams new notifications as they occur.`,
		Tags:        []string{"Notifications"},
		OperationID: "liveNotifications",
		Security:    security.WithAuth("profile"),
	}, map[string]any{
		"message": lightmodels.Notification{},
	}, ctrl.liveNotifications)

	huma.Register(api, huma.Operation{
		Method:      "POST",
		Path:        "/notifications/{id}/read",
		Summary:     "Mark notification as read",
		Description: `This endpoint is used to mark a notification as read.`,
		Tags:        []string{"Notifications"},
		OperationID: "markNotificationAsRead",
		Security:    security.WithAuth("profile"),
	}, ctrl.markNotificationAsRead)
}

func (ctrl *notificationController) liveNotifications(
	ctx context.Context,
	input *struct{},
	send sse.Sender,
) {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return
	}

	result, err := ctrl.notificationsService.ListLastNotifications(ctx, 10)
	if err != nil {
		return
	}

	for _, notif := range result {
		if notif != nil {
			_ = send.Data(*notif)
		}
	}

	_ = ctrl.pubsubService.Subscribe(ctx, fmt.Sprintf("Notification:%d", userID), func(message []byte) error {
		var notification lightmodels.Notification
		if err := json.Unmarshal(message, &notification); err != nil {
			return err
		}

		return send.Data(notification)
	})
}

func (ctrl *notificationController) markNotificationAsRead(
	ctx context.Context,
	input *notificationIDInput,
) (*BodyMessage, error) {
	err := ctrl.notificationsService.MarkAsRead(ctx, input.NotificationID)
	if err != nil {
		return nil, err
	}

	return &BodyMessage{
		Body: "Notification marked as read",
	}, nil
}
