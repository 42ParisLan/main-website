package notificationsservice

import (
	"base-website/ent"
	"base-website/ent/notification"
	"base-website/ent/user"
	"base-website/internal/lightmodels"
	"base-website/internal/security"
	databaseservice "base-website/internal/services/database"
	"base-website/pkg/errorfilters"
	"context"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type NotificationsService interface {
	MarkAsRead(ctx context.Context, notificationID int) error
	CreateNotification(ctx context.Context, userID int, notifType, title, message, href string) (*ent.Notification, error)
	ListLastNotifications(ctx context.Context, limit int) ([]*lightmodels.Notification, error)
}

type notificationsService struct {
	databaseService databaseservice.DatabaseService
	errorFilter     errorfilters.ErrorFilter
}

func NewProvider() func(i *do.Injector) (NotificationsService, error) {
	return func(i *do.Injector) (NotificationsService, error) {
		return New(
			do.MustInvoke[databaseservice.DatabaseService](i),
		)
	}
}

func New(
	databaseService databaseservice.DatabaseService,
) (NotificationsService, error) {
	return &notificationsService{
		databaseService: databaseService,
		errorFilter:     errorfilters.NewEntErrorFilter().WithEntityTypeName("notification"),
	}, nil
}

func (svc *notificationsService) MarkAsRead(
	ctx context.Context,
	notificationID int,
) error {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	entNotification, err := svc.databaseService.Notification.Query().
		Where(
			notification.IDEQ(notificationID),
			notification.HasUserWith(user.IDEQ(userID)),
		).
		Only(ctx)
	if err != nil {
		return svc.errorFilter.Filter(err, "get")
	}

	if entNotification.Read {
		return huma.Error400BadRequest("notification already marked as read")
	}

	now := time.Now()
	_, err = svc.databaseService.Notification.UpdateOneID(notificationID).
		SetRead(true).
		SetReadAt(now).
		Save(ctx)
	if err != nil {
		return svc.errorFilter.Filter(err, "update")
	}

	return nil
}

func (svc *notificationsService) CreateNotification(
	ctx context.Context,
	userID int,
	notifType, title, message, href string,
) (*ent.Notification, error) {
	entNotification, err := svc.databaseService.Notification.
		Create().
		SetUserID(userID).
		SetType(notifType).
		SetTitle(title).
		SetMessage(message).
		SetHref(href).
		Save(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "create")
	}

	return entNotification, nil
}

func (svc *notificationsService) ListLastNotifications(
	ctx context.Context,
	limit int,
) ([]*lightmodels.Notification, error) {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	if limit <= 0 {
		limit = 10
	}

	notifs, err := svc.databaseService.Notification.Query().
		Where(notification.HasUserWith(user.IDEQ(userID))).
		Order(ent.Desc(notification.FieldCreatedAt)).
		Limit(limit).
		All(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "list")
	}

	return lightmodels.NewNotificationsFromEnt(notifs), nil
}
