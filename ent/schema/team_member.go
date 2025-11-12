package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
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
		edge.From("user", User.Type).
			Ref("team_memberships").
			Unique().
			Required(),
		edge.From("team", Team.Type).
			Ref("members").
			Unique().
			Required(),
	}
}
