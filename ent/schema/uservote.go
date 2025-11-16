package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type UserVote struct {
	ent.Schema
}

func (UserVote) Fields() []ent.Field {
	return []ent.Field{
		field.Time("created_at").Default(time.Now),
	}
}

func (UserVote) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("user", User.Type).
			Unique().
			Required().
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),

		edge.To("component", Component.Type).
			Unique().
			Required().
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
	}
}
