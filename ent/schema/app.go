package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// App holds the schema definition for the App entity.
type App struct {
	ent.Schema
}

// Fields of the App.
func (App) Fields() []ent.Field {
	return []ent.Field{
		field.String("id"),
		field.String("secret"),
		field.String("name"),
		field.JSON("redirect_uris", []string{}),
		field.Bool("implicit_consent"),
		field.String("description"),
		field.Time("created_at").Immutable().Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
		field.Time("last_login_at").Optional().Nillable(),
		field.Int("owner_id"),
		field.Strings("roles").Default([]string{}),
	}
}

// Edges of the App.
func (App) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("owner", User.Type).
			Ref("apps").
			Field("owner_id").
			Annotations(entsql.OnDelete(entsql.Cascade)).
			Unique().Required(),
		edge.To("consents", Consent.Type),
	}
}
