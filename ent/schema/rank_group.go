package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
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
		edge.To("tournament", Tournament.Type).
			Unique().
			Required().
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
		edge.From("teams", Team.Type).
			Ref("rank_group"),
	}
}

func (RankGroup) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("position").
			Edges("tournament").
			Unique(),
	}
}
