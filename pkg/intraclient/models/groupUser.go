package intraclientmodels

type GroupUserGroup struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

type GroupUser struct {
	ID     int            `json:"id"`
	UserID int            `json:"user_id"`
	Group  GroupUserGroup `json:"group"`
}
