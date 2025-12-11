package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
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
		field.String("image_url").Optional().Nillable(),
		field.Bool("is_visible").Default(false),
		field.Time("registration_start"),
		field.Time("registration_end"),
		field.Time("tournament_start"),
		field.Time("tournament_end").Optional().Nillable(),
		field.Int("max_teams"),
		field.JSON("team_structure", map[string]interface{}{}).Optional(),
		field.String("custom_page_component").Default("default"),
		field.JSON("external_links", map[string]string{}).Optional(),
		field.Enum("tier").Values("S Tier", "A Tier", "B Tier", "C Tier", "D Tier", "E Tier", "F Tier").Default("C Tier"),
		field.Time("created_at").Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
	}
}

func (Tournament) Edges() []ent.Edge {
	return []ent.Edge{
		edge.From("creator", User.Type).
			Ref("created_tournaments").
			Unique().
			Required(),
		edge.To("admins", TournamentAdmin.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("teams", Team.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("rank_groups", RankGroup.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
		edge.To("team_members", TeamMember.Type).
			Annotations(entsql.OnDelete(entsql.Cascade)),
	}
}
