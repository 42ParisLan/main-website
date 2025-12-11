package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
	"entgo.io/ent/schema/index"
)

type Team struct {
	ent.Schema
}

func (Team) Fields() []ent.Field {
	return []ent.Field{
		field.String("name"),
		field.String("image_url").Optional().Nillable(),
		field.Bool("is_locked").Default(false),
		field.Bool("is_registered").Default(false),
		field.Bool("is_waitlisted").Default(false),
		field.Int("waitlist_position").Optional().Nillable(),
		field.Int("score").Optional(),
		field.Int("elo").Optional().Nillable(),
		field.Time("created_at").Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
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
		edge.To("members", TeamMember.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.From("rank_group", RankGroup.Type).
			Ref("teams").
			Unique(),
		edge.To("invitations", Invitation.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
	}
}

func (Team) Indexes() []ent.Index {
	return []ent.Index{
		index.Edges("creator", "tournament").Unique(),
	}
}

// func (Team) Hook() []ent.Hook {
// 	return []ent.Hook{
// 		hooks.AssignRegistrationOnLockHook(),
// 	}
// }
