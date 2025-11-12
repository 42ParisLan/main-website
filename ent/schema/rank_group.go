package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type RankGroup struct {
	ent.Schema
}

func (RankGroup) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"), // e.g. "Top 8", "Top 16", "17-32"
		field.Int("rank_min"),
		field.Int("rank_max"),
	}
}

func (RankGroup) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tournament", Tournament.Type).
			Ref("rank_groups").
			Unique().
			Required(),
		edge.From("teams", Team.Type).
			Ref("rank_group"),
	}
}
