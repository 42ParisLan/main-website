package schema

import (
	"time"

	"entgo.io/ent"
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
		field.String("picture").Optional().Nillable(),
		field.Enum("kind").Values("user", "admin").Default("user"),
		field.Strings("roles").Default([]string{"user"}),
	}
}

// Edges of the User.
func (User) Edges() []ent.Edge {
	return []ent.Edge{
		edge.To("user_votes", UserVote.Type),
		edge.To("created_votes", Vote.Type),
		edge.To("apps", App.Type),
		edge.To("consents", Consent.Type),
		edge.To("team_memberships", TeamMember.Type),
		edge.To("received_invitations", Invitation.Type),
		edge.To("created_teams", Team.Type),
		edge.To("created_tournaments", Tournament.Type),
		edge.To("tournament_admin_roles", TournamentAdmin.Type),
	}
}
