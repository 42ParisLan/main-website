package votesmodels

// ComponentResult represents the aggregated vote count for a component.
type ComponentResult struct {
	ComponentID int    `json:"component_id" example:"1" description:"The ID of the component"`
	Name        string `json:"name" example:"Go" description:"The name of the component"`
	Votes       int    `json:"votes" example:"120" description:"The number of votes for the component"`
}

// ResultsResponse is the response payload for a vote results query.
type ResultsResponse struct {
	VoteID     int               `json:"vote_id" example:"1" description:"The ID of the vote"`
	Results    []ComponentResult `json:"results" description:"The list of results per component"`
	TotalVotes int               `json:"total_votes" example:"290" description:"The total number of votes across all components"`
}
