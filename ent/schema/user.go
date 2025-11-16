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
		edge.From("user_votes", UserVote.Type).
			Ref("user"),
		edge.From("created_votes", Vote.Type).
			Ref("creator"),
		edge.From("apps", App.Type).
			Ref("owner"),
		edge.From("consents", Consent.Type).
			Ref("user"),
		edge.From("team_memberships", TeamMember.Type).
			Ref("user"),
		edge.From("received_invitations", Invitation.Type).
			Ref("invitee"),
		edge.From("created_teams", Team.Type).
			Ref("creator"),
		edge.From("created_tournaments", Tournament.Type).
			Ref("creator"),
		edge.From("tournament_admins", TournamentAdmin.Type).
			Ref("user"),
	}
}
