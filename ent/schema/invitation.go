package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type Invitation struct {
	ent.Schema
}

func (Invitation) Fields() []ent.Field {
	return []ent.Field{
		field.Time("created_at").
			Default(time.Now),
		field.String("message").
			Optional(),
		field.String("role"),
	}
}

func (Invitation) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("team", Team.Type).
			Ref("invitations").
			Unique().
			Required(),
		edge.From("invitee", User.Type).
			Ref("received_invitations").
			Unique().
			Required(),
	}
}

func (Invitation) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("team", "invitee").Unique(),
	}
}
