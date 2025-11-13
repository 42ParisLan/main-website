package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

type Tournament struct {
	ent.Schema
}

func (Tournament) Fields() []ent.Field {
	return []ent.Field{
		field.String("slug").Unique(),
		field.String("name"),
		field.String("description"),
		field.Bool("is_visible").Default(false),
		field.Time("registration_start"),
		field.Time("registration_end"),
		field.Time("tournament_start"),
		field.Time("tournament_end"),
		field.Enum("state").
			Values("DRAFT", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "ONGOING", "FINISHED").
			Default("DRAFT"),
		field.Int("max_teams"),
		field.JSON("team_structure", map[string]interface{}{}).Optional(),
		field.String("custom_page_component").Default("default"),
		field.String("external_link").Optional(),
		field.JSON("results", map[string]interface{}{}).Optional(),
		field.Time("created_at").Default(time.Now),
	}
}

func (Tournament) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("creator", User.Type).
			Ref("created_tournaments").
			Unique().
			Required(),
		edge.To("admins", TournamentAdmin.Type),
		edge.To("teams", Team.Type),
		edge.To("rank_groups", RankGroup.Type),
	}
}
