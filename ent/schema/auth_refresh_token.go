package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

// AuthRefreshToken holds the schema definition for the AuthRefreshToken entity.
type AuthRefreshToken struct {
	ent.Schema
}

// Fields of the AuthRefreshToken.
func (AuthRefreshToken) Fields() []ent.Field {
	return []ent.Field{
		field.String("id"),
		field.String("Token"),
		field.String("subject"),
		field.Time("auth_time"),
		field.JSON("amr", []string{}),
		field.JSON("audience", []string{}),
		field.String("user_id"),
		field.String("application_id"),
		field.Time("expiration"),
		field.JSON("scopes", []string{}),
	}
}

func (AuthRefreshToken) Edges() []ent.Edge {
	return nil
}
