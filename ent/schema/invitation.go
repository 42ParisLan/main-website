package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Invitation struct {
	ent.Schema
}

func (Invitation) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("status").
			Values("PENDING", "ACCEPTED", "DECLINED", "EXPIRED", "REVOKED").
			Default("PENDING"),
		field.Time("created_at").
			Default(time.Now),
		field.Time("expires_at").
			Optional(),
		field.String("message").
			Optional(),
	}
}

func (Invitation) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("team", Team.Type).
			Unique().
			Required().
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
		edge.To("invitee", User.Type).
			Unique().
			Required().
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
	}
}
