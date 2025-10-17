package intraclientmodels

import "time"

type TeamUser struct {
	ID             int    `json:"id"`
	Login          string `json:"login"`
	URL            string `json:"url"`
	Leader         bool   `json:"leader"`
	Occurrence     int    `json:"occurrence"`
	Validated      bool   `json:"validated"`
	ProjectsUserID int    `json:"projects_user_id"`
}

type Team struct {
	ID                int                `json:"id"`
	Name              string             `json:"name"`
	URL               string             `json:"url"`
	FinalMark         int                `json:"final_mark"`
	ProjectID         int                `json:"project_id"`
	CreatedAt         time.Time          `json:"created_at"`
	UpdatedAt         time.Time          `json:"updated_at"`
	Status            string             `json:"status"`
	TerminatingAt     time.Time          `json:"terminating_at"`
	Users             []TeamUser         `json:"users"`
	Locked            bool               `json:"locked?"`
	Validated         bool               `json:"validated?"`
	Closed            bool               `json:"closed?"`
	RepoURL           string             `json:"repo_url"`
	RepoUUID          string             `json:"repo_uuid"`
	LockedAt          time.Time          `json:"locked_at"`
	ClosedAt          time.Time          `json:"closed_at"`
	ProjectSessionID  int                `json:"project_session_id"`
	ProjectGitlabPath string             `json:"project_git_path"`
	ScaleTeams        []PartialScaleTeam `json:"scale_teams"`
	TeamsUploads      []interface{}      `json:"teams_uploads"`
}

type PartialTeam struct {
	ID                int        `json:"id"`
	Name              string     `json:"name"`
	URL               string     `json:"url"`
	FinalMark         int        `json:"final_mark"`
	ProjectID         int        `json:"project_id"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	Status            string     `json:"status"`
	TerminatingAt     time.Time  `json:"terminating_at"`
	Users             []TeamUser `json:"users"`
	Locked            bool       `json:"locked?"`
	Validated         bool       `json:"validated?"`
	Closed            bool       `json:"closed?"`
	RepoURL           string     `json:"repo_url"`
	RepoUUID          string     `json:"repo_uuid"`
	LockedAt          time.Time  `json:"locked_at"`
	ClosedAt          time.Time  `json:"closed_at"`
	ProjectSessionID  int        `json:"project_session_id"`
	ProjectGitlabPath string     `json:"project_gitlab_path"`
}
