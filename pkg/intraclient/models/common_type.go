package intraclientmodels

type Skill struct {
	ID    int     `json:"id"`
	Name  string  `json:"name"`
	Level float64 `json:"level"`
}

type ImageVersions struct {
	Large  string `json:"large"`
	Medium string `json:"medium"`
	Small  string `json:"small"`
	Micro  string `json:"micro"`
}

type Image struct {
	Link     string        `json:"link"`
	Versions ImageVersions `json:"versions"`
}
