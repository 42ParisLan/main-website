package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type Notification struct {
	ent.Schema
}

func (Notification) Fields() []ent.Field {
	return []ent.Field{
		field.Time("created_at").
			Default(time.Now).
			Immutable(),
		field.String("type").
			NotEmpty(),
		field.String("title").
			NotEmpty(),
		field.String("message").
			Optional(),
		field.String("href").
			Optional().
			Nillable(),
		field.Bool("read").
			Default(false),
		field.Time("read_at").
			Optional().
			Nillable(),
	}
}

func (Notification) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("user", User.Type).
			Ref("notifications").
			Unique().
			Required(),
	}
}

func (Notification) Indexes() []ent.Index {
	return []ent.Index{
		index.Fields("created_at"),
		index.Fields("read"),
		index.Edges("user"),
	}
}
