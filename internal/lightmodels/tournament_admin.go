package lightmodels

import "base-website/ent"

type LightTournamentAdmin struct {
	User LightUser `json:"user" description:"The user information of the tournament admin"`
	Role string    `json:"role" example:"admin" description:"The role of the admin in the tournament, e.g., admin, super_admin"`
}

func NewLightTournamentAdminFromEnt(entTournamentAdmin *ent.TournamentAdmin) *LightTournamentAdmin {
	if entTournamentAdmin == nil {
		return nil
	}

	if entTournamentAdmin.Edges.User == nil {
		return nil
	}

	u := NewLightUserFromEnt(entTournamentAdmin.Edges.User)
	if u == nil {
		return nil
	}

	return &LightTournamentAdmin{
		User: *u,
		Role: string(entTournamentAdmin.Role),
	}
}

func NewLightTournamentAdminsFromEnt(entTournamentAdmins []*ent.TournamentAdmin) []*LightTournamentAdmin {
	admins := make([]*LightTournamentAdmin, len(entTournamentAdmins))
	for i, t := range entTournamentAdmins {
		admins[i] = NewLightTournamentAdminFromEnt(t)
	}
	return admins
}
