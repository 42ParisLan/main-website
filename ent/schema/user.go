package schema

import (
	"time"

	"entgo.io/ent"
	"entgo.io/ent/dialect/entsql"
	"entgo.io/ent/schema/edge"
	"entgo.io/ent/schema/field"
)

// User holds the schema definition for the User entity.
type User struct {
	ent.Schema
}

// Fields of the User.
func (User) Fields() []ent.Field {
	return []ent.Field{
		field.Int("id"),
		field.String("username").Unique(),
		field.String("email"),
		field.Time("created_at").Immutable().Default(time.Now),
		field.Time("updated_at").Default(time.Now).UpdateDefault(time.Now),
		field.Time("anonymized_at").Optional().Nillable(),
		field.Int("intra_id").Optional().Nillable().Unique(),
		field.String("picture").Optional().Nillable(),
		field.Enum("kind").Values("user", "admin").Default("user"),
		field.Strings("roles").Default([]string{"user"}),
	}
}

// Edges of the User.
func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("user_votes", UserVote.Type).
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
		edge.To("created_votes", Vote.Type),
		edge.To("apps", App.Type).
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
		edge.To("consents", Consent.Type).
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
		edge.To("team_memberships", TeamMember.Type).
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
		edge.To("received_invitations", Invitation.Type).
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
		edge.To("created_teams", Team.Type).
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
		edge.To("created_tournaments", Tournament.Type),
		edge.To("tournament_admins", TournamentAdmin.Type).
			Annotations(entsql.Annotation{OnDelete: entsql.Cascade}),
	}
}
