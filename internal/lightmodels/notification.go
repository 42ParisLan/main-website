package lightmodels

import (
	"base-website/ent"
	"time"
)

type Notification struct {
	ID        int        `json:"id" description:"Id of the notification"`
	CreatedAt time.Time  `json:"created_at" description:"Notification creation time"`
	Type      string     `json:"type" description:"Type of notification (team, tournament, vote, invitation, system)"`
	Title     string     `json:"title" description:"Title of the notification"`
	Message   string     `json:"message" description:"Message content of the notification"`
	Href      *string    `json:"href,omitempty" description:"Target URL when clicking the notification"`
	Read      bool       `json:"read" description:"Whether the notification has been read"`
	ReadAt    *time.Time `json:"read_at,omitempty" description:"When the notification was read"`
}

func NewNotificationFromEnt(entNotification *ent.Notification) *Notification {
	if entNotification == nil {
		return nil
	}

	return &Notification{
		ID:        entNotification.ID,
		CreatedAt: entNotification.CreatedAt,
		Type:      entNotification.Type,
		Title:     entNotification.Title,
		Message:   entNotification.Message,
		Href:      entNotification.Href,
		Read:      entNotification.Read,
		ReadAt:    entNotification.ReadAt,
	}
}

func NewNotificationsFromEnt(entNotifications []*ent.Notification) []*Notification {
	notifications := make([]*Notification, len(entNotifications))
	for i, entNotification := range entNotifications {
		notifications[i] = NewNotificationFromEnt(entNotification)
	}
	return notifications
}
