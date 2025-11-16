package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type TournamentAdmin struct {
	ent.Schema
}

func (TournamentAdmin) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("role").
			Values("CREATOR", "SUPER_ADMIN", "ADMIN").
			Default("ADMIN"),
	}
}

func (TournamentAdmin) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("user", User.Type).
			Unique().
			Required().
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),

		edge.To("tournament", Tournament.Type).
			Unique().
			Required().
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
	}
}
