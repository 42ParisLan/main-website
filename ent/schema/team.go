package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Team struct {
	ent.Schema
}

func (Team) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("image_url").Optional(),
		field.Enum("status").
			Values("DRAFT", "LOCKED", "CONFIRMED", "WAITING", "DISQUALIFIED").
			Default("DRAFT"),
		field.Bool("is_locked").Default(false),
		field.Int("queue_position").Optional(),
		field.Int("score").Optional(),
		field.Time("created_at").Default(time.Now),
	}
}

func (Team) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("tournament", Tournament.Type).
			Ref("teams").
			Unique().
			Required(),
		edge.From("creator", User.Type).
			Ref("created_teams").
			Unique().
			Required(),
		edge.To("members", TeamMember.Type),
		edge.To("rank_group", RankGroup.Type).Unique(),
		edge.To("invitations", Invitation.Type),
	}
}
