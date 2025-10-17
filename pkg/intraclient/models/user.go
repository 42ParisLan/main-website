package intraclientmodels

import "time"

type IntraUser struct {
	ID              int                 `json:"id"`
	Email           string              `json:"email"`
	Login           string              `json:"login"`
	FirstName       string              `json:"first_name"`
	LastName        string              `json:"last_name"`
	UsualFullName   string              `json:"usual_full_name"`
	UsualFirstName  *string             `json:"usual_first_name,omitempty"`
	URL             string              `json:"url"`
	Phone           string              `json:"phone"`
	Displayname     string              `json:"displayname"`
	Kind            string              `json:"kind"`
	Image           *Image              `json:"image"`
	Staff           bool                `json:"staff?"`
	CorrectionPoint int                 `json:"correction_point"`
	PoolMonth       string              `json:"pool_month"`
	PoolYear        string              `json:"pool_year"`
	Location        *string             `json:"location,omitempty"`
	Wallet          int                 `json:"wallet"`
	AnonymizeDate   string              `json:"anonymize_date"`
	DataErasureDate string              `json:"data_erasure_date"`
	CreatedAt       string              `json:"created_at"`
	UpdatedAt       string              `json:"updated_at"`
	AlumnizedAt     *string             `json:"alumnized_at"`
	Alumni          bool                `json:"alumni?"`
	Active          bool                `json:"active?"`
	Groups          []Group             `json:"groups"`
	CursusUsers     []PartialCursusUser `json:"cursus_users"`
	ProjectsUsers   []ProjectsUser      `json:"projects_users"`
	LanguagesUsers  []LanguagesUser     `json:"languages_users"`
	Achievements    []Achievement       `json:"achievements"`
	Titles          []Group             `json:"titles"`
	TitlesUsers     []TitlesUser        `json:"titles_users"`
	Campus          []Campus            `json:"campus"`
	CampusUsers     []CampusUser        `json:"campus_users"`
	Roles           []IntraRole         `json:"roles"`
}

type Achievement struct {
	ID           int    `json:"id"`
	Name         string `json:"name"`
	Description  string `json:"description"`
	Tier         string `json:"tier"`
	Kind         string `json:"kind"`
	Visible      bool   `json:"visible"`
	Image        string `json:"image"`
	NbrOfSuccess *int   `json:"nbr_of_success"`
	UsersURL     string `json:"users_url"`
}

type Campus struct {
	ID                 int      `json:"id"`
	Name               string   `json:"name"`
	TimeZone           string   `json:"time_zone"`
	Language           Language `json:"language"`
	UsersCount         int      `json:"users_count"`
	VogsphereID        int      `json:"vogsphere_id"`
	Country            string   `json:"country"`
	Address            string   `json:"address"`
	Zip                string   `json:"zip"`
	City               string   `json:"city"`
	Website            string   `json:"website"`
	Facebook           string   `json:"facebook"`
	Twitter            string   `json:"twitter"`
	Active             bool     `json:"active"`
	Public             bool     `json:"public"`
	EmailExtension     string   `json:"email_extension"`
	DefaultHiddenPhone bool     `json:"default_hidden_phone"`
}

type Language struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	Identifier string `json:"identifier"`
	CreatedAt  string `json:"created_at"`
	UpdatedAt  string `json:"updated_at"`
}

type CampusUser struct {
	ID        int    `json:"id"`
	UserID    int    `json:"user_id"`
	CampusID  int    `json:"campus_id"`
	IsPrimary bool   `json:"is_primary"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type PartialCursusUser struct {
	Grade        *string   `json:"grade"`
	Level        float64   `json:"level"`
	Skills       []Skill   `json:"skills"`
	BlackholedAt *string   `json:"blackholed_at"`
	ID           int       `json:"id"`
	BeginAt      string    `json:"begin_at"`
	EndAt        *string   `json:"end_at"`
	CursusID     int       `json:"cursus_id"`
	HasCoalition bool      `json:"has_coalition"`
	CreatedAt    string    `json:"created_at"`
	UpdatedAt    string    `json:"updated_at"`
	User         IntraUser `json:"user"`
	Cursus       Cursus    `json:"cursus"`
}

type Cursus struct {
	ID        int    `json:"id"`
	CreatedAt string `json:"created_at"`
	Name      string `json:"name"`
	Slug      string `json:"slug"`
	Kind      string `json:"kind"`
}

type Group struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type LanguagesUser struct {
	ID         int    `json:"id"`
	LanguageID int    `json:"language_id"`
	UserID     int    `json:"user_id"`
	Position   int    `json:"position"`
	CreatedAt  string `json:"created_at"`
}

type ProjectsUser struct {
	ID            int            `json:"id"`
	Occurrence    int            `json:"occurrence"`
	FinalMark     *int           `json:"final_mark"`
	Status        ProjectStatus  `json:"status"`
	Validated     *bool          `json:"validated?"`
	CurrentTeamID *int           `json:"current_team_id"`
	Project       PartialProject `json:"project"`
	CursusIDS     []int          `json:"cursus_ids"`
	MarkedAt      *string        `json:"marked_at"`
	Marked        bool           `json:"marked"`
	RetriableAt   *string        `json:"retriable_at"`
	CreatedAt     string         `json:"created_at"`
	UpdatedAt     string         `json:"updated_at"`
}

type TitlesUser struct {
	ID        int    `json:"id"`
	UserID    int    `json:"user_id"`
	TitleID   int    `json:"title_id"`
	Selected  bool   `json:"selected"`
	CreatedAt string `json:"created_at"`
	UpdatedAt string `json:"updated_at"`
}

type ProjectStatus string

const (
	Finished        ProjectStatus = "finished"
	InProgress      ProjectStatus = "in_progress"
	SearchingAGroup ProjectStatus = "searching_a_group"
)

type IntraRole struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type PartialUser struct {
	ID              int        `json:"id"`
	Email           string     `json:"email"`
	Login           string     `json:"login"`
	FirstName       string     `json:"first_name"`
	LastName        string     `json:"last_name"`
	UsualFullName   string     `json:"usual_full_name"`
	UsualFirstName  *string    `json:"usual_first_name"`
	URL             string     `json:"url"`
	Phone           string     `json:"phone"`
	Displayname     string     `json:"displayname"`
	Kind            string     `json:"kind"`
	Image           Image      `json:"image"`
	Staff           bool       `json:"staff?"`
	CorrectionPoint int        `json:"correction_point"`
	PoolMonth       string     `json:"pool_month"`
	PoolYear        string     `json:"pool_year"`
	Location        *string    `json:"location"`
	Wallet          int        `json:"wallet"`
	AnonymizeDate   time.Time  `json:"anonymize_date"`
	DataErasureDate time.Time  `json:"data_erasure_date"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
	AlumnizedAt     *time.Time `json:"alumnized_at"`
	Alumni          bool       `json:"alumni?"`
	Active          bool       `json:"active?"`
}

type LightIntraUser struct {
	Login string `json:"login"`
	ID    int    `json:"id"`
	URL   string `json:"url"`
}
