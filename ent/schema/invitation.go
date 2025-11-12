package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Invitation struct {
	ent.Schema
}

func (Invitation) Fields() []ent.Field {
	return []ent.Field{
		field.Enum("status").
			Values("PENDING", "ACCEPTED", "DECLINED", "EXPIRED", "REVOKED").
			Default("PENDING"),
		field.Time("created_at").
			Default(time.Now),
		field.Time("expires_at").
			Optional(),
		field.String("message").
			Optional(),
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
