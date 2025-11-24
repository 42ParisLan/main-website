package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type RankGroup struct {
	ent.Schema
}

func (RankGroup) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"), // e.g. "Top 8", "Top 16", "17-32"
		field.Int("rank_min"),
		field.Int("rank_max"),
		field.Int("position"),
	}
}

func (RankGroup) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tournament", Tournament.Type).
			Ref("rank_groups").
			Unique().
			Required(),
		edge.To("teams", Team.Type),
	}
}

func (RankGroup) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("position").
			Edges("tournament").
			Unique(),
	}
}
