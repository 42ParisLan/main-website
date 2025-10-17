package intraclient

import (
	"context"
	"fmt"
	"net/http"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/clientcredentials"
)

const intraTokenURL = "https://api.intra.42.fr/oauth/token"

type ClientConfig struct {
	// ClientID is the client ID for the API
	ClientID string

	// ClientSecret is the client secret for the API
	ClientSecret string
}

type Client struct {
	httpClient *http.Client
}

func NewClient(ctx context.Context, config *ClientConfig) (*Client, error) {
	oauth2Config := clientcredentials.Config{
		ClientID:     config.ClientID,
		ClientSecret: config.ClientSecret,
		TokenURL:     intraTokenURL,
		Scopes:       []string{"public"},
	}

	return &Client{
		httpClient: oauth2.NewClient(ctx, oauth2Config.TokenSource(ctx)),
	}, nil
}

func NewClientWithUserBearerToken(
	ctx context.Context,
	config *ClientConfig,
	code string,
	redirectURI string,
) (*Client, error) {
	oauth2Config := &oauth2.Config{
		ClientID:     config.ClientID,
		ClientSecret: config.ClientSecret,
		Endpoint: oauth2.Endpoint{
			TokenURL: intraTokenURL,
		},
		RedirectURL: redirectURI,
	}

	token, err := oauth2Config.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("failed to exchange code for token: %w", err)
	}

	return &Client{
		httpClient: oauth2.NewClient(ctx, oauth2.StaticTokenSource(token)),
	}, nil
}
