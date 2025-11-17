package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Team struct {
	ent.Schema
}

func (Team) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("image_url").Default("teams/default.png"),
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
		edge.To("tournament", Tournament.Type).
			Unique().
			Required().
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
		edge.To("creator", User.Type).
			Unique().
			Required(),
		edge.From("members", TeamMember.Type).
			Ref("team"),
		edge.To("rank_group", RankGroup.Type).Unique(),
		edge.From("invitations", Invitation.Type).
			Ref("team"),
	}
}
