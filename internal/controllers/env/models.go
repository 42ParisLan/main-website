package envcontroller

type envResponse struct {
	OAuthAuthorizeURL string `json:"VITE_OAUTH_AUTHORIZE_URL"`
	OAuthClientID     string `json:"VITE_OAUTH_CLIENT_ID"`
}

type getEnv struct {
	Body envResponse `json:"body" required:"true"`
}
