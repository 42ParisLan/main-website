package rankgroupmodels

type UpdateRankGroup struct {
	Position int `json:"position"`
	RankMin  int `json:"rank_min"`
	RankMax  int `json:"rank_max"`
}
