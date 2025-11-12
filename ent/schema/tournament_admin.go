package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type TournamentAdmin struct {
	ent.Schema
}

func (TournamentAdmin) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("role").
			Values("SUPER_ADMIN", "ADMIN").
			Default("ADMIN"),
	}
}

func (TournamentAdmin) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).
			Ref("tournament_admin_roles").
			Unique().
			Required(),

		edge.From("tournament", Tournament.Type).
			Ref("admins").
			Unique().
			Required(),
	}
}
