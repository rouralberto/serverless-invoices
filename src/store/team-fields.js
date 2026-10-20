import { defineStore } from 'pinia';
import { useRepo } from 'pinia-orm';
import TeamField from '@/store/models/team-field';
import { useTeamsStore } from '@/store/teams';
import { updateRecord } from '@/store/orm';

const repo = () => useRepo(TeamField);

export const useTeamFieldsStore = defineStore('teamFields', {
  actions: {
    init() {},
    terminate() {},
    teamFieldProps(payload) {
      return updateRecord(repo(), payload.fieldId, payload.props);
    },
    updateTeamField(payload) {
      this.teamFieldProps(payload);
      return useTeamsStore().updateTeam(null);
    },
    addNewField(teamId) {
      repo().save({ team_id: teamId });
    },
    deleteTeamField(fieldId) {
      repo().destroy(fieldId);
      return useTeamsStore().updateTeam(null);
    },
  },
});
