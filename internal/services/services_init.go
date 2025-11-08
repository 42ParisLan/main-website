package services

import (
	appsservice "base-website/internal/services/apps"
	authservice "base-website/internal/services/auth"
	configservice "base-website/internal/services/config"
	consentsservice "base-website/internal/services/consents"
	databaseservice "base-website/internal/services/database"
	intraservice "base-website/internal/services/intra"
	openidservice "base-website/internal/services/openid"
	pubsubservice "base-website/internal/services/pubsub"
	rbacservice "base-website/internal/services/rbac"
	usersservice "base-website/internal/services/users"
	votesservice "base-website/internal/services/votes"

	"github.com/samber/do"
)

func InitServices(i *do.Injector) error {
	do.Provide(i, configservice.NewProvider())
	do.Provide(i, rbacservice.NewProvider())
	do.Provide(i, databaseservice.NewProvider())
	do.Provide(i, openidservice.NewProvider())
	do.Provide(i, authservice.NewProvider())
	do.Provide(i, intraservice.NewProvider())
	do.Provide(i, usersservice.NewProvider())
	do.Provide(i, pubsubservice.NewProvider())
	do.Provide(i, votesservice.NewProvider())
	do.Provide(i, appsservice.NewProvider())
	do.Provide(i, consentsservice.NewProvider())
	return nil
}
