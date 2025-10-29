package schema

import (
	"time"

	"entgo.io/ent"
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
		// Each vote belongs to exactly one user
		edge.From("user", User.Type).Ref("user_votes").Unique().Required(),

		// Each vote targets exactly one component
		edge.From("component", Component.Type).Ref("user_votes").Unique().Required(),
	}
}
