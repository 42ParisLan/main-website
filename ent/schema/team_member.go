package schema

import (
	"entgo.io/ent"
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
		field.Bool("can_receive_team_elo").Default(true),
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
		edge.From("tournament", Tournament.Type).
			Ref("team_members").
			Unique().
			Required(),
	}
}

func (TeamMember) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("user", "tournament").Unique(),
		index.Edges("user", "team").Unique(),
	}
}
