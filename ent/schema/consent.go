package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// Consent holds the schema definition for the Consent entity.
type Consent struct {
	ent.Schema
}

// Fields of the Consent.
func (Consent) Fields() []ent.Field {
	return []ent.Field{
		field.Int("id"),
		field.Time("created_at").Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
		field.String("application_id"),
		field.Int("user_id"),
		field.Strings("scopes"),
		field.Time("expiration_date"),
	}
}

// Edges of the Consent.
func (Consent) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("application", App.Type).
			Field("application_id").
			Unique().
			Required().
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
		edge.To("user", User.Type).
			Field("user_id").
			Unique().
			Required().
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
	}
}
