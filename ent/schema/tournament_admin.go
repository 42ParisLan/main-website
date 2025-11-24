package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
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
		edge.From("user", User.Type).
			Ref("tournament_admins").
			Unique().
			Required(),

		edge.From("tournament", Tournament.Type).
			Ref("admins").
			Unique().
			Required(),
	}
}

func (TournamentAdmin) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("user", "tournament").Unique(),
	}
}
