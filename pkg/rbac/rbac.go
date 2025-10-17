package rbac

import (
	"fmt"
	"io"

	"gopkg.in/yaml.v3"
)

type Rbac struct {
	Roles      map[string]*Role `json:"roles" description:"roles"`
	RoleKeyMap map[string]string
}

func New(stream io.Reader) (*Rbac, error) {
	decoder := yaml.NewDecoder(stream)
	var rbac Rbac
	err := decoder.Decode(&rbac)
	if err != nil {
		return nil, err
	}

	newRoles := make(map[string]*Role)
	roleKeyMap := make(map[string]string)
	for originalKey, role := range rbac.Roles {
		if role != nil {
			newRoles[role.Name] = role
			roleKeyMap[originalKey] = role.Name
		}
	}
	rbac.Roles = newRoles
	rbac.RoleKeyMap = roleKeyMap
	return &rbac, nil
}

func (r *Rbac) GetRole(name string) *Role {
	return r.Roles[name]
}

func (r *Rbac) GetRoleNameFromKeycloackRole(name string) (string, error) {
	roleName, ok := r.RoleKeyMap[name]
	if !ok {
		return "", fmt.Errorf("role key %s not found", name)
	}
	return roleName, nil
}

func (c *Rbac) Can(roleNames []string, path string, verb string) bool {
	permissions := c.GetPermissions(roleNames)
	for _, permission := range permissions {
		if permission.Can(path, verb) {
			return true
		}
	}
	return false
}

func (c *Rbac) GetPermissions(roleNames []string) []*Permission {
	permissions := make([]*Permission, 0)
	for _, roleName := range roleNames {
		role, ok := c.Roles[roleName]
		if !ok {
			continue
		}
		permissions = append(permissions, resolvePermissions(role, c)...)
	}
	return permissions
}

func CheckPermission(permissions []*Permission, path string, verb string) bool {
	for _, permission := range permissions {
		if permission.Can(path, verb) {
			return true
		}
	}
	return false
}

func resolvePermissions(role *Role, rbac *Rbac) []*Permission {
	permissions := make([]*Permission, 0)
	permissions = append(permissions, role.Permissions...)
	for _, inheritRoleName := range role.Inherits {
		inheritedPerms, ok := rbac.Roles[inheritRoleName]
		if !ok {
			continue
		}
		permissions = append(permissions, resolvePermissions(inheritedPerms, rbac)...)
	}
	return permissions
}
