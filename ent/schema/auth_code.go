package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

// AuthCode holds the schema definition for the AuthCode entity.
type AuthCode struct {
	ent.Schema
}

// Fields of the AuthCode.
func (AuthCode) Fields() []ent.Field {
	return []ent.Field{
		field.String("id"),
		field.String("auth_request_id"),
		field.Time("expiration").Default(func() time.Time {
			return time.Now().Add(5 * time.Minute)
		}),
	}
}

// Edges of the AuthCode.
func (AuthCode) Edges() []ent.Edge {
	return nil
}
