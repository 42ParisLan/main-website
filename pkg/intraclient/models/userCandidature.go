package intraclientmodels

import "time"

type UserCandidature struct {
	ID                 int         `json:"id"`
	UserID             int         `json:"user_id"`
	BirthDate          string      `json:"birth_date"`
	Gender             string      `json:"gender"`
	ZipCode            string      `json:"zip_code"`
	Country            string      `json:"country"`
	BirthCity          string      `json:"birth_city"`
	BirthCountry       string      `json:"birth_country"`
	PostalStreet       string      `json:"postal_street"`
	PostalComplement   string      `json:"postal_complement"`
	PostalCity         string      `json:"postal_city"`
	PostalZipCode      string      `json:"postal_zip_code"`
	PostalCountry      string      `json:"postal_country"`
	ContactAffiliation string      `json:"contact_affiliation"`
	ContactLastName    string      `json:"contact_last_name"`
	ContactFirstName   string      `json:"contact_first_name"`
	ContactPhone1      string      `json:"contact_phone1"`
	ContactPhone2      string      `json:"contact_phone2"`
	MaxLevelMemory     interface{} `json:"max_level_memory"`
	MaxLevelLogic      interface{} `json:"max_level_logic"`
	OtherInformation   interface{} `json:"other_information"`
	Language           string      `json:"language"`
	MeetingDate        interface{} `json:"meeting_date"`
	PiscineDate        interface{} `json:"piscine_date"`
	CreatedAt          time.Time   `json:"created_at"`
	UpdatedAt          time.Time   `json:"updated_at"`
	Phone              string      `json:"phone"`
	Email              string      `json:"email"`
	Pin                string      `json:"pin"`
	PhoneCountryCode   string      `json:"phone_country_code"`
	HiddenPhone        bool        `json:"hidden_phone"`
}
