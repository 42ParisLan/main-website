package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Vote struct {
	ent.Schema
}

func (Vote) Fields() []ent.Field {
	return []ent.Field{
		field.String("title"),
		field.String("description").Optional(),
		field.Bool("visible").Default(false),
		field.Time("start_at"),
		field.Time("end_at"),
		field.Time("created_at").Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

func (Vote) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("components", Component.Type).
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
		edge.From("creator", User.Type).
			Ref("created_votes").
			Unique().
			Required(),
	}
}
