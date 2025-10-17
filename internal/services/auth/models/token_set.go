package authmodels

type TokenSet struct {
	AccessToken  string `json:"access_token" example:"42token" description:"The access token"`
	RefreshToken string `json:"refresh_token" example:"42token" description:"The refresh token"`
	TokenType    string `json:"token_type" example:"Bearer" description:"The token type"`
	ExpiresIn    uint64 `json:"expires_in" example:"3600" description:"The time in seconds until the token expires"`
	Scope        string `json:"scope" example:"openid" description:"The scope of the token"`
}
