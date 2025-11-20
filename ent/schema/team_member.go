package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type TeamMember struct {
	ent.Schema
}

func (TeamMember) Fields() []ent.Field {
	return []ent.Field{
		field.String("role"), // e.g., "player", "coach", "substitute"
	}
}

func (TeamMember) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("user", User.Type).
			Unique().
			Required().
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
		edge.To("team", Team.Type).
			Unique().
			Required().
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
		edge.To("tournament", Tournament.Type).
			Unique().
			Required().
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
	}
}

func (TeamMember) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("user").
			Edges("tournament").
			Unique(),
	}
}
