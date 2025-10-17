package rbac

import "strings"

type Role struct {
	Name        string        `json:"name" description:"role name" example:"admin"`
	Description string        `json:"description" description:"role description" example:"admin role"`
	Permissions []*Permission `json:"permissions" description:"role permissions" nullable:"false"`
	Inherits    []string      `json:"inherits" description:"roles that this role inherits" example:"admin role inherits" nullable:"false"`
}

func (r *Role) Can(path string, verb string) bool {
	for _, permission := range r.Permissions {
		if permission.Can(path, verb) {
			return true
		}
	}
	return false
}

type Permission struct {
	Path    string   `json:"path" description:"permission path" example:"/users"`
	Methods []string `json:"methods" description:"permission methods" example:"[\"GET\"]" nullable:"false"`
}

func (p *Permission) Can(path string, verb string) bool {
	if !p.wildcardMatch(path) {
		return false
	}
	for _, method := range p.Methods {
		if method == "*" || method == verb {
			return true
		}
	}
	return false
}

//////////////////////// Helper functions ////////////////////////

func (p *Permission) wildcardMatch(path string) bool {
	if p.Path == path {
		return true
	}
	if p.Path == "*" {
		return true
	}
	pathParts := strings.Split(path, "/")
	referencePathParts := strings.Split(p.Path, "/")
	if len(pathParts) < len(referencePathParts) {
		return false
	}
	for i := 0; i < len(pathParts); i++ {
		if i >= len(referencePathParts) {
			return false
		}
		if referencePathParts[i] == "*" {
			continue
		}
		if pathParts[i] != referencePathParts[i] {
			return false
		}
	}
	return true
}
