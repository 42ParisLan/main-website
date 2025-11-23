package invitationsmodels

type CreateInvitation struct {
	Message string `json:"message" description:"Message of the invitation"`
	Role    string `json:"role" description:"Role in the team"`
	UserID  int    `json:"user_id" description:"ID of the user to invite"`
}
