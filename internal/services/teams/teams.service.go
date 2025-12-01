package teamsservice

import (
	"base-website/ent"
	"base-website/ent/team"
	"base-website/ent/teammember"
	"base-website/ent/tournament"
	"base-website/ent/user"
	"base-website/internal/lightmodels"
	"base-website/internal/security"
	databaseservice "base-website/internal/services/database"
	rbacservice "base-website/internal/services/rbac"
	s3service "base-website/internal/services/s3"
	teamsmodels "base-website/internal/services/teams/models"
	tournamentsservice "base-website/internal/services/tournaments"
	"base-website/pkg/errorfilters"
	"base-website/pkg/paging"
	"context"
	"encoding/json"
	"fmt"
	"path/filepath"
	"strings"
	"time"

	"github.com/danielgtaylor/huma/v2"
	"github.com/samber/do"
)

type TeamsService interface {
	ListTeamsByTournament(ctx context.Context, params *teamsmodels.ListTeamsParams) (*paging.Response[*lightmodels.LightTeam], error)
	CreateTeam(ctx context.Context, input *teamsmodels.CreateTeam, tournamentID int) (*lightmodels.LightTeam, error)
	GetMyTeam(ctx context.Context, tournamentID int) (*lightmodels.LightTeam, error)
	GetTeam(ctx context.Context, teamID int) (*lightmodels.LightTeam, error)
	UpdateTeam(ctx context.Context, teamID int, input *teamsmodels.UpdateTeam) (*lightmodels.LightTeam, error)
	DeleteTeam(ctx context.Context, teamID int) error
	LeaveTeam(ctx context.Context, teamID int) error
	LockTeam(ctx context.Context, teamID int) (*lightmodels.LightTeam, error)
	UnlockTeam(ctx context.Context, teamID int) (*lightmodels.LightTeam, error)
}

type teamsService struct {
	databaseService    databaseservice.DatabaseService
	errorFilter        errorfilters.ErrorFilter
	rbacService        rbacservice.RBACService
	s3service          s3service.S3Service
	tournamentsService tournamentsservice.TournamentsService
}

func NewProvider() func(i *do.Injector) (TeamsService, error) {
	return func(i *do.Injector) (TeamsService, error) {
		return New(
			do.MustInvoke[databaseservice.DatabaseService](i),
			do.MustInvoke[rbacservice.RBACService](i),
			do.MustInvoke[s3service.S3Service](i),
			do.MustInvoke[tournamentsservice.TournamentsService](i),
		)
	}
}

func New(
	databaseService databaseservice.DatabaseService,
	rbacService rbacservice.RBACService,
	s3service s3service.S3Service,
	tournamentsService tournamentsservice.TournamentsService,
) (TeamsService, error) {
	return &teamsService{
		databaseService:    databaseService,
		errorFilter:        errorfilters.NewEntErrorFilter().WithEntityTypeName("team"),
		rbacService:        rbacService,
		s3service:          s3service,
		tournamentsService: tournamentsService,
	}, nil
}

func (svc *teamsService) ListTeamsByTournament(
	ctx context.Context,
	params *teamsmodels.ListTeamsParams,
) (*paging.Response[*lightmodels.LightTeam], error) {
	query := svc.databaseService.Team.Query().Where(team.HasTournamentWith(tournament.IDEQ(params.TournamentID)))

	if params.Status != "all" {
		switch params.Status {
		case "locked", "draft":
			query.Where(team.IsLockedEQ(params.Status == "locked"))
		case "register":
			query.Where(team.IsRegisteredEQ(true))
		case "waitlist":
			query.Where(team.IsWaitlistedEQ(true))
		}
	}

	if params.HasRankGroup != "all" {
		switch params.HasRankGroup {
		case "yes":
			query.Where(team.HasRankGroup())
		case "no":
			query.Where(team.Not(team.HasRankGroup()))
		}
	}

	total, err := query.Count(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "count")
	}

	query = paging.ApplyQueryPaging(query, params.Input)

	if params.Order == "asc" {
		query = query.Order(ent.Asc(team.FieldID))
	} else {
		query = query.Order(ent.Desc(team.FieldID))
	}

	teams, err := query.
		WithMembers(func(teamMemberQuery *ent.TeamMemberQuery) {
			teamMemberQuery.WithUser()
		}).
		WithRankGroup().
		All(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "get")
	}

	limit := params.Input.Limit
	page := params.Input.Page
	return paging.CreatePagingResponse(lightmodels.NewLightTeamsFromEnt(ctx, teams, svc.s3service), total, page, limit), nil
}

func (svc *teamsService) CreateTeam(
	ctx context.Context,
	input *teamsmodels.CreateTeam,
	tournamentID int,
) (*lightmodels.LightTeam, error) {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	entTeamMember, err := svc.databaseService.TeamMember.Query().Where(
		teammember.HasUserWith(user.IDEQ(userID)),
		teammember.HasTournamentWith(tournament.IDEQ(tournamentID)),
	).Only(ctx)
	if err == nil {
		return nil, huma.Error401Unauthorized("user has already a team in this tournament")
	}

	entTournament, err := svc.databaseService.Tournament.Get(ctx, tournamentID)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "retrieve tournament")
	}

	if entTournament.IsVisible == false {
		return nil, huma.Error401Unauthorized("tournament isn't visible")
	}

	now := time.Now()
	if now.Before(entTournament.RegistrationStart) || now.After(entTournament.RegistrationEnd) {
		return nil, huma.Error401Unauthorized("tournament isn't in registration phase")
	}

	_, exists := entTournament.TeamStructure[input.CreatorStatus]
	if !exists {
		return nil, huma.Error400BadRequest(fmt.Sprintf("status '%s' not found for tournament", input.CreatorStatus))
	}

	entTeam, err := svc.databaseService.Team.
		Create().
		SetName(input.Name).
		SetTournamentID(entTournament.ID).
		SetCreatorID(userID).
		Save(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "create team")
	}

	entTeamMember, err = svc.databaseService.TeamMember.
		Create().
		SetTeamID(entTeam.ID).
		SetUserID(userID).
		SetTournamentID(entTournament.ID).
		SetRole(input.CreatorStatus).
		Save(ctx)
	if err != nil {
		svc.databaseService.Team.Delete().Where(team.ID(entTeam.ID)).Exec(ctx)
		return nil, svc.errorFilter.Filter(err, "create team member")
	}

	if input.Image.Filename != "" {
		sanitized := strings.ReplaceAll(input.Image.Filename, " ", "_")
		ext := filepath.Ext(sanitized)
		base := strings.TrimSuffix(sanitized, ext)
		if base == "" {
			base = "file"
		}

		objectName := fmt.Sprintf("teams/%d/%d_%s%s", entTeam.ID, time.Now().UnixNano(), base, ext)

		if err := svc.s3service.UploadObject(ctx, objectName, input.Image.File, input.Image.Size, input.Image.ContentType); err != nil {
			return nil, svc.errorFilter.Filter(err, "upload image")
		}

		entTeam, err = svc.databaseService.Team.
			UpdateOneID(entTeam.ID).
			SetImageURL(objectName).
			Save(ctx)
		if err != nil {
			svc.s3service.RemoveObject(ctx, objectName)
			svc.databaseService.Team.Delete().Where(team.ID(entTeam.ID)).Exec(ctx)
			svc.databaseService.TeamMember.Delete().Where(teammember.ID(entTeamMember.ID)).Exec(ctx)
			return nil, svc.errorFilter.Filter(err, "update team image")
		}
	}

	entTeam, err = svc.databaseService.Team.
		Query().
		Where(team.IDEQ(entTeam.ID)).
		WithMembers(func(teamMemberQuery *ent.TeamMemberQuery) {
			teamMemberQuery.WithUser()
		}).
		WithRankGroup().
		Only(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "retrieve team")
	}

	return lightmodels.NewLightTeamFromEnt(ctx, entTeam, svc.s3service), nil
}

func (svc *teamsService) GetMyTeam(
	ctx context.Context,
	tournamentID int,
) (*lightmodels.LightTeam, error) {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	entTeamMember, err := svc.databaseService.TeamMember.Query().Where(
		teammember.HasUserWith(user.IDEQ(userID)),
		teammember.HasTournamentWith(tournament.IDEQ(tournamentID)),
	).Only(ctx)
	if err != nil {
		return nil, err
	}

	entTeam, err := entTeamMember.
		QueryTeam().
		WithMembers(func(teamMemberQuery *ent.TeamMemberQuery) {
			teamMemberQuery.WithUser()
		}).
		WithRankGroup().
		WithCreator().
		Only(ctx)
	if err != nil {
		return nil, err
	}

	return lightmodels.NewLightTeamFromEnt(ctx, entTeam, svc.s3service), nil
}

func (svc *teamsService) GetTeam(
	ctx context.Context,
	teamID int,
) (*lightmodels.LightTeam, error) {
	entTeam, err := svc.databaseService.Team.Query().
		Where(team.IDEQ(teamID)).
		WithMembers(func(teamMemberQuery *ent.TeamMemberQuery) {
			teamMemberQuery.WithUser()
		}).
		WithRankGroup().
		WithCreator().
		Only(ctx)
	if err != nil {
		return nil, err
	}

	return lightmodels.NewLightTeamFromEnt(ctx, entTeam, svc.s3service), nil
}

func (svc *teamsService) UpdateTeam(
	ctx context.Context,
	teamID int,
	input *teamsmodels.UpdateTeam,
) (*lightmodels.LightTeam, error) {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	entTeam, err := svc.databaseService.Team.Query().
		Where(team.IDEQ(teamID)).
		WithMembers(func(teamMemberQuery *ent.TeamMemberQuery) {
			teamMemberQuery.WithUser()
		}).
		WithRankGroup().
		WithCreator().
		WithTournament().
		Only(ctx)
	if err != nil {
		return nil, err
	}

	if entTeam.Edges.Tournament.TournamentEnd != nil && time.Now().After(*entTeam.Edges.Tournament.TournamentEnd) {
		return nil, huma.Error401Unauthorized("tournament is finished")
	}

	myRole, err := svc.tournamentsService.GetTournamentUserRole(ctx, entTeam.Edges.Tournament.ID)
	if err != nil {
		return nil, err
	}
	if myRole == nil || entTeam.Edges.Creator == nil || entTeam.Edges.Creator.ID != userID {
		return nil, huma.Error401Unauthorized("don't have required role")
	}

	update := svc.databaseService.Team.UpdateOneID(entTeam.ID)

	if input.Name != "" {
		update.SetName(input.Name)
	}
	if input.Image.Filename != "" {
		sanitized := strings.ReplaceAll(input.Image.Filename, " ", "_")
		ext := filepath.Ext(sanitized)
		base := strings.TrimSuffix(sanitized, ext)
		if base == "" {
			base = "file"
		}

		objectName := fmt.Sprintf("teams/%d/%d_%s%s", teamID, time.Now().UnixNano(), base, ext)

		if err := svc.s3service.UploadObject(ctx, objectName, input.Image.File, input.Image.Size, input.Image.ContentType); err != nil {
			return nil, svc.errorFilter.Filter(err, "upload image")
		}

		if entTeam.ImageURL != nil {
			svc.s3service.RemoveObject(ctx, *entTeam.ImageURL)
		}

		update.SetImageURL(objectName)
	}

	savedTeam, err := update.Save(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "update")
	}

	return lightmodels.NewLightTeamFromEnt(ctx, savedTeam, svc.s3service), nil
}

func (svc *teamsService) DeleteTeam(
	ctx context.Context,
	teamID int,
) error {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	entTeam, err := svc.databaseService.Team.Query().
		Where(team.IDEQ(teamID)).
		WithCreator().
		WithTournament().
		Only(ctx)
	if err != nil {
		return err
	}

	if entTeam.Edges.Tournament.TournamentEnd != nil && time.Now().After(*entTeam.Edges.Tournament.TournamentEnd) {
		return huma.Error401Unauthorized("tournament is finished")
	}

	myRole, err := svc.tournamentsService.GetTournamentUserRole(ctx, entTeam.Edges.Tournament.ID)
	if err != nil {
		return err
	}
	if myRole == nil || entTeam.Edges.Creator == nil || entTeam.Edges.Creator.ID != userID {
		return huma.Error401Unauthorized("don't have required role")
	}

	if err := svc.databaseService.Team.DeleteOneID(entTeam.ID).Exec(ctx); err != nil {
		return svc.errorFilter.Filter(err, "delete_component")
	}

	if entTeam.ImageURL != nil {
		svc.s3service.RemoveObject(ctx, *entTeam.ImageURL)
	}

	if entTeam.IsRegistered {
		waitingTeam, err := svc.databaseService.Team.Query().
			Where(
				team.HasTournamentWith(tournament.IDEQ(entTeam.Edges.Tournament.ID)),
				team.IsWaitlisted(true),
			).
			Order(ent.Asc(team.FieldWaitlistPosition)).
			First(ctx)
		if err != nil && !ent.IsNotFound(err) {
			return err
		}

		if waitingTeam != nil {
			_, err = waitingTeam.Update().
				SetIsRegistered(true).
				SetIsWaitlisted(false).
				ClearWaitlistPosition().
				Save(ctx)
			if err != nil {
				return err
			}
		}
	}

	if entTeam.IsRegistered || entTeam.IsWaitlisted {
		waitlistTeams, _ := svc.databaseService.Team.Query().
			Where(
				team.HasTournamentWith(tournament.IDEQ(entTeam.Edges.Tournament.ID)),
				team.IsWaitlisted(true),
			).
			Order(ent.Asc(team.FieldWaitlistPosition)).
			All(ctx)

		for i, t := range waitlistTeams {
			t.Update().SetWaitlistPosition(i + 1).Save(ctx)
		}
	}

	return nil
}

func (svc *teamsService) LeaveTeam(
	ctx context.Context,
	teamID int,
) error {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return err
	}

	entTeam, err := svc.databaseService.Team.Query().
		Where(team.IDEQ(teamID)).
		WithMembers(func(teamMemberQuery *ent.TeamMemberQuery) {
			teamMemberQuery.WithUser()
		}).
		WithCreator().
		WithTournament().
		Only(ctx)
	if err != nil {
		return err
	}

	if entTeam.Edges.Tournament.TournamentEnd != nil && time.Now().After(*entTeam.Edges.Tournament.TournamentEnd) {
		return huma.Error401Unauthorized("tournament is finished")
	}

	if entTeam.IsLocked == true {
		return huma.Error401Unauthorized("can't leave team if this one is locked")
	}

	if entTeam.Edges.Creator != nil && userID == entTeam.Edges.Creator.ID {
		return huma.Error401Unauthorized("creator of the team can't leave it")
	}

	for _, member := range entTeam.Edges.Members {
		if member == nil || member.Edges.User == nil {
			continue
		}
		if member.Edges.User.ID == userID {
			if err := svc.databaseService.TeamMember.DeleteOneID(member.ID).Exec(ctx); err != nil {
				return svc.errorFilter.Filter(err, "leave_team")
			}
			return nil
		}
	}

	return huma.Error401Unauthorized("you're not in this team")
}

func (svc *teamsService) LockTeam(
	ctx context.Context,
	teamID int,
) (*lightmodels.LightTeam, error) {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	entTeam, err := svc.databaseService.Team.Query().
		Where(team.IDEQ(teamID)).
		WithMembers(func(teamMemberQuery *ent.TeamMemberQuery) {
			teamMemberQuery.WithUser()
		}).
		WithCreator().
		WithTournament().
		Only(ctx)
	if err != nil {
		return nil, err
	}

	if entTeam.Edges.Tournament.TournamentEnd != nil && time.Now().After(*entTeam.Edges.Tournament.TournamentEnd) {
		return nil, huma.Error401Unauthorized("tournament is finished")
	}

	if entTeam.Edges.Creator == nil || entTeam.Edges.Creator.ID != userID {
		return nil, huma.Error401Unauthorized("only creator of the team can lock it")
	}

	teamsMembers := entTeam.Edges.Members

	if entTeam.Edges.Tournament == nil {
		return nil, svc.errorFilter.Filter(fmt.Errorf("team has no tournament attached"), "lock_team")
	}

	if entTeam.IsLocked {
		return nil, huma.Error400BadRequest("team is already locked")
	}

	var parsed map[string]lightmodels.TeamStructure
	bs, err := json.Marshal(entTeam.Edges.Tournament.TeamStructure)
	if err != nil {
		return nil, svc.errorFilter.Filter(fmt.Errorf("invalid teamStructure JSON: %w", err), "lock_team")
	}
	if err := json.Unmarshal(bs, &parsed); err != nil {
		return nil, svc.errorFilter.Filter(fmt.Errorf("invalid teamStructure JSON: %w", err), "lock_team")
	}

	count := make(map[string]int, len(parsed))
	for _, member := range teamsMembers {
		if member == nil {
			continue
		}
		count[member.Role] += 1
	}
	for role, value := range parsed {
		c := count[role]
		if c < value.Min || c > value.Max {
			return nil, huma.Error400BadRequest("team does not match required structure")
		}
	}

	update := svc.databaseService.Team.UpdateOneID(entTeam.ID).SetIsLocked(true)

	registeredCount, _ := svc.databaseService.Team.Query().
		Where(team.HasTournamentWith(tournament.IDEQ(entTeam.Edges.Tournament.ID)), team.IsRegistered(true)).
		Count(ctx)
	if registeredCount < entTeam.Edges.Tournament.MaxTeams {
		update.SetIsRegistered(true)
		update.SetIsWaitlisted(false)
		update.ClearWaitlistPosition()
	} else {
		waitlistCount, _ := svc.databaseService.Team.Query().
			Where(team.HasTournamentWith(tournament.IDEQ(entTeam.Edges.Tournament.ID)), team.IsWaitlisted(true)).
			Count(ctx)

		update.SetIsRegistered(false)
		update.SetIsWaitlisted(true)
		update.SetWaitlistPosition(waitlistCount + 1)
	}
	_, err = update.Save(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "save team")
	}

	reloaded, err := svc.databaseService.Team.Query().
		Where(team.IDEQ(teamID)).
		WithMembers(func(teamMemberQuery *ent.TeamMemberQuery) {
			teamMemberQuery.WithUser()
		}).
		WithRankGroup().
		WithCreator().
		Only(ctx)
	if err != nil {
		return nil, err
	}

	return lightmodels.NewLightTeamFromEnt(ctx, reloaded, svc.s3service), nil
}

func (svc *teamsService) UnlockTeam(
	ctx context.Context,
	teamID int,
) (*lightmodels.LightTeam, error) {
	userID, err := security.GetUserIDFromContext(ctx)
	if err != nil {
		return nil, err
	}

	entTeam, err := svc.databaseService.Team.Query().
		Where(team.IDEQ(teamID)).
		WithCreator().
		WithTournament().
		Only(ctx)
	if err != nil {
		return nil, err
	}

	if entTeam.Edges.Tournament.TournamentEnd != nil && time.Now().After(*entTeam.Edges.Tournament.TournamentEnd) {
		return nil, huma.Error401Unauthorized("tournament is finished")
	}
	myRole, err := svc.tournamentsService.GetTournamentUserRole(ctx, entTeam.Edges.Tournament.ID)
	if err != nil {
		return nil, err
	}
	if myRole == nil || entTeam.Edges.Creator == nil || entTeam.Edges.Creator.ID != userID {
		return nil, huma.Error401Unauthorized("don't have required role")
	}

	if !entTeam.IsLocked {
		return nil, huma.Error400BadRequest("team is not locked")
	}

	wasRegistered := entTeam.IsRegistered
	wasWaitlisted := entTeam.IsWaitlisted

	entTeam, err = svc.databaseService.Team.UpdateOneID(entTeam.ID).
		SetIsLocked(false).
		SetIsRegistered(false).
		SetIsWaitlisted(false).
		ClearWaitlistPosition().
		Save(ctx)
	if err != nil {
		return nil, svc.errorFilter.Filter(err, "unlock_team")
	}

	if wasRegistered {
		waitingTeam, err := svc.databaseService.Team.Query().
			Where(
				team.HasTournamentWith(tournament.IDEQ(entTeam.Edges.Tournament.ID)),
				team.IsWaitlisted(true),
			).
			Order(ent.Asc(team.FieldWaitlistPosition)).
			First(ctx)
		if err != nil && !ent.IsNotFound(err) {
			return nil, err
		}

		if waitingTeam != nil {
			_, err = waitingTeam.Update().
				SetIsRegistered(true).
				SetIsWaitlisted(false).
				ClearWaitlistPosition().
				Save(ctx)
			if err != nil {
				return nil, err
			}
		}
	}

	if wasRegistered || wasWaitlisted {
		waitlistTeams, _ := svc.databaseService.Team.Query().
			Where(
				team.HasTournamentWith(tournament.IDEQ(entTeam.Edges.Tournament.ID)),
				team.IsWaitlisted(true),
			).
			Order(ent.Asc(team.FieldWaitlistPosition)).
			All(ctx)

		for i, t := range waitlistTeams {
			t.Update().SetWaitlistPosition(i + 1).Save(ctx)
		}
	}

	reloaded, err := svc.databaseService.Team.Query().
		Where(team.IDEQ(teamID)).
		WithMembers(func(teamMemberQuery *ent.TeamMemberQuery) {
			teamMemberQuery.WithUser()
		}).
		WithRankGroup().
		WithCreator().
		Only(ctx)
	if err != nil {
		return nil, err
	}

	return lightmodels.NewLightTeamFromEnt(ctx, reloaded, svc.s3service), nil
}
