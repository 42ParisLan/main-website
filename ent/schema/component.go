package schema

import (
	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Component struct {
	ent.Schema
}

func (Component) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("description").Optional(),
		field.String("image_url").Default("components/default.png"),
		field.String("color").Optional(),
	}
}

func (Component) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("vote", Vote.Type).Ref("components").Unique().Required(),
		edge.To("user_votes", UserVote.Type),
	}
}
