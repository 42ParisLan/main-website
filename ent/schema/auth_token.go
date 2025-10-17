package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/field"
)

// AuthToken holds the schema definition for the AuthToken entity.
type AuthToken struct {
	ent.Schema
}

// Fields of the AuthToken.
func (AuthToken) Fields() []ent.Field {
	return []ent.Field{
		field.String("id"),
		field.String("application_id"),
		field.String("subject"),
		field.String("refresh_token_id"),
		field.JSON("audience", []string{}),
		field.Time("expiration"),
		field.JSON("scopes", []string{}),
	}
}

func (AuthToken) Edges() []ent.Edge {
	return nil
}
