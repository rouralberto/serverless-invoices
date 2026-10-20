<template>
    <div>
        <div class="container app__content">
            <div class="row justify-content-center">
                <div class="d-flex flex-column justify-content-between col-12 min-vh-100 pt-5 pb-2">
                    <router-view v-slot="{ Component }">
                        <transition name="fade" mode="out-in">
                            <component :is="Component"/>
                        </transition>
                    </router-view>
                    <TheFooter/>
                </div>
            </div>
        </div>
        <CustomizationsModal/>
        <ClientModal v-if="team"/>
        <TeamModal v-if="team"/>
        <BankAccountModal v-if="team"/>
        <ImportModal/>
    </div>
</template>

<script>
import { mapState } from 'pinia';
import ClientModal from '@/components/clients/ClientModal.vue';
import BankAccountModal from '@/components/bank-accounts/BankAccountModal.vue';
import TeamModal from '@/components/team/TeamModal.vue';
import TheFooter from '@/components/TheFooter.vue';
import CustomizationsModal from '@/components/invoices/CustomizationsModal.vue';
import ImportModal from '../../components/ImportModal.vue';
import { useTeamsStore } from '@/store/teams';

export default {
  components: {
    TheFooter,
    TeamModal,
    ImportModal,
    BankAccountModal,
    ClientModal,
    CustomizationsModal,
  },
  computed: {
    ...mapState(useTeamsStore, ['team']),
  },
};
</script>
