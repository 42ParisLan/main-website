package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
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
		edge.From("user", User.Type).
			Ref("user_votes").
			Unique().
			Required(),

		edge.From("component", Component.Type).
			Ref("user_votes").
			Unique().
			Required(),
	}
}

func (UserVote) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("user", "component").Unique(),
	}
}
