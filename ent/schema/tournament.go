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
		field.String("image_url").Default("tournaments/default.png"),
		field.Bool("is_visible").Default(false),
		field.Time("registration_start"),
		field.Time("registration_end"),
		field.Time("tournament_start"),
		field.Time("tournament_end").Optional().Nillable(),
		field.Int("max_teams"),
		field.JSON("team_structure", map[string]interface{}{}).Optional(),
		field.String("custom_page_component").Default("default"),
		field.JSON("external_links", map[string]string{}).Optional(),
		field.Time("created_at").Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

func (Tournament) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("creator", User.Type).
			Unique().
			Required(),
		edge.From("admins", TournamentAdmin.Type).
			Ref("tournament"),
		edge.From("teams", Team.Type).
			Ref("tournament"),
		edge.From("rank_groups", RankGroup.Type).
			Ref("tournament"),
	}
}
