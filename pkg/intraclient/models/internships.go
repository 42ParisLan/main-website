package intraclientmodels

import "time"

type InternshipConventionData struct {
	URL string `json:"url"`
}

type InternshipConvention struct {
	Convention InternshipConventionData `json:"convention"`
}

type Internship struct {
	ID                       int                  `json:"id"`
	AdministrationID         int                  `json:"administration_id"`
	OfferID                  *int                 `json:"offer_id"`
	LanguageID               int                  `json:"language_id"`
	State                    string               `json:"state"`
	Days                     string               `json:"days"`
	UserAddress              string               `json:"user_address"`
	UserPostal               string               `json:"user_postal"`
	UserCity                 string               `json:"user_city"`
	UserCountry              string               `json:"user_country"`
	CompanyName              string               `json:"company_name"`
	CompanyBossUserFirstName string               `json:"company_boss_user_first_name"`
	CompanyBossUserLastName  string               `json:"company_boss_user_last_name"`
	CompanyBossUserEmail     string               `json:"company_boss_user_email"`
	CompanyBossUserPhone     string               `json:"company_boss_user_phone"`
	CompanyUserFirstName     string               `json:"company_user_first_name"`
	CompanyUserLastName      string               `json:"company_user_last_name"`
	CompanyUserPost          string               `json:"company_user_post"`
	CompanyUserEmail         string               `json:"company_user_email"`
	CompanyUserPhone         string               `json:"company_user_phone"`
	CompanyAddress           string               `json:"company_address"`
	CompanyPostal            string               `json:"company_postal"`
	CompanyCity              string               `json:"company_city"`
	CompanyCountry           string               `json:"company_country"`
	CompanySiret             string               `json:"company_siret"`
	InternshipAddress        string               `json:"internship_address"`
	InternshipPostal         string               `json:"internship_postal"`
	InternshipCity           string               `json:"internship_city"`
	InternshipCountry        string               `json:"internship_country"`
	ContractType             string               `json:"contract_type"`
	Subject                  string               `json:"subject"`
	StartAt                  time.Time            `json:"start_at"`
	EndAt                    time.Time            `json:"end_at"`
	Duration                 int                  `json:"duration"`
	NbDays                   int                  `json:"nb_days"`
	NbHours                  int                  `json:"nb_hours"`
	Movement                 *string              `json:"movement"`
	Salary                   float64              `json:"salary"`
	Currency                 string               `json:"currency"`
	BreachAt                 *string              `json:"breach_at"`
	Convention               InternshipConvention `json:"convention"`
	ConventionURI            string               `json:"convention_uri"`
	User                     PartialUser          `json:"user"`
	ProjectsUser             int                  `json:"projects_user"`
	ProjectUser              *ProjectUser         `json:"project_user"`
}
