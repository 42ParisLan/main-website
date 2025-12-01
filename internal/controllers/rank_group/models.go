package rankgroupcontroller

import (
	"base-website/internal/lightmodels"
	rankgroupmodels "base-website/internal/services/rank_group/models"
)

type tournamentIDInput struct {
	TournamentID int `path:"id" required:"true" example:"42" description:"The tournament ID"`
}

type multipleRankGroupsOutput struct {
	Body []*lightmodels.LightRankGroup `nullable:"false"`
}

type updateRankGroupsInput struct {
	TournamentID int                               `path:"id" required:"true" example:"42" description:"The tournament ID"`
	Body         []rankgroupmodels.UpdateRankGroup `nullable:"false"`
}

type oneTeamOutput struct {
	Body *lightmodels.LightTeam `required:"true"`
}

type updateTeamRankGroupBody struct {
	RankGroupID int `json:"rank_group_id" required:"true" example:"1" description:"The rank group ID"`
}

type updateTeamRankGroupInput struct {
	TeamID int                     `path:"id" required:"true" example:"42" description:"The team ID"`
	Body   updateTeamRankGroupBody `required:"true"`
}
