package lightmodels

import "base-website/ent"

type LightTournamentAdmin struct {
	User LightUser `json:"user" description:"The user information of the tournament admin"`
	Role string    `json:"role" example:"ADMIN" enum:"ADMIN,SUPER_ADMIN,CREATOR" description:"The role of the admin in the tournament"`
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
	admins := make([]*LightTournamentAdmin, 0, len(entTournamentAdmins))
	for _, t := range entTournamentAdmins {
		if a := NewLightTournamentAdminFromEnt(t); a != nil {
			admins = append(admins, a)
		}
	}
	return admins
}
