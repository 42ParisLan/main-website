package lightmodels

import "base-website/ent"

type LightRankGroup struct {
	ID       int    `json:"id" example:"1"`
	Name     string `json:"name" example:"Top 8"`
	RankMin  int    `json:"rank_min" example:"1"`
	RankMax  int    `json:"rank_max" example:"8"`
	Position int    `json:"position" example:"1"`
}

func NewLightRankGroupFromEnt(entRankGroup *ent.RankGroup) *LightRankGroup {
	if entRankGroup == nil {
		return nil
	}
	return &LightRankGroup{
		ID:       entRankGroup.ID,
		Name:     entRankGroup.Name,
		RankMin:  entRankGroup.RankMin,
		RankMax:  entRankGroup.RankMax,
		Position: entRankGroup.Position,
	}
}

func NewLightRankGroupsFromEnt(entRankGroups []*ent.RankGroup) []*LightRankGroup {
	groups := make([]*LightRankGroup, len(entRankGroups))
	for i, g := range entRankGroups {
		groups[i] = NewLightRankGroupFromEnt(g)
	}
	return groups
}
