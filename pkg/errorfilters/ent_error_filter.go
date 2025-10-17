package errorfilters

import (
	"errors"
	"fmt"

	"base-website/ent"
	"base-website/pkg/logger"

	"github.com/danielgtaylor/huma/v2"
)

type FilterErrorFunc func(err error, operation string, entityID ...int) error

type ErrorFilter interface {
	// FilterError censor the error in more user-friendly way
	Filter(err error, operation string, entityID ...int) error
	WithEntityTypeName(entityName string) ErrorFilter
}

type entErrorFilter struct {
	entityTypeName *string
	logger         *logger.Logger
}

func NewEntErrorFilter() ErrorFilter {
	return &entErrorFilter{
		logger: logger.New().WithContext("EntErrorFilter"),
	}
}

func (f *entErrorFilter) Filter(err error, operation string, entityID ...int) error {
	if err == nil {
		return nil
	}
	var localEntityID *int
	if len(entityID) > 0 {
		localEntityID = &entityID[0]
	}
	errorMessage := f.buildErrorMessage(operation, localEntityID)
	if ent.IsNotFound(err) {
		return huma.Error404NotFound(
			"entity_not_found",
			errors.New(errorMessage),
		)
	}
	if ent.IsConstraintError(err) {
		f.logger.Warn("constraint error: %s: %s", errorMessage, err)
		return huma.Error400BadRequest(
			"constraint_error",
			fmt.Errorf("%s: %s", errorMessage, err),
		)
	}
	if ent.IsValidationError(err) {
		f.logger.Warn("validation error: %s: %s", errorMessage, err)
		return huma.Error400BadRequest(
			"validation_error",
			fmt.Errorf("%s: %s", errorMessage, err),
		)
	}
	f.logger.Error("unexpected error: %s: %s", errorMessage, err)
	return huma.Error500InternalServerError(
		"unexpected_error",
		fmt.Errorf("unexpected error, please check the logs"),
	)
}

func (f *entErrorFilter) WithEntityTypeName(entityName string) ErrorFilter {
	f.entityTypeName = &entityName
	return f
}

func (f *entErrorFilter) buildErrorMessage(operation string, entityID *int) string {
	errorMessage := ""
	if f.entityTypeName != nil {
		errorMessage = fmt.Sprintf("could not %s %s", operation, *f.entityTypeName)
	} else {
		errorMessage = "could not %s entity"
	}
	if entityID != nil {
		errorMessage = fmt.Sprintf("%s with ID %d", errorMessage, *entityID)
	}
	return errorMessage
}
