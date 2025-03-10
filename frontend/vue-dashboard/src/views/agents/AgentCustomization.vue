<template>
  <div class="agent-customization">
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-title class="text-h5 font-weight-bold d-flex justify-space-between align-center">
            <span>
              <v-icon start color="primary" class="me-2">mdi-robot-outline</v-icon>
              Agent Customization Wizard
            </span>
            
            <div>
              <v-btn color="secondary" @click="goBack">
                <v-icon start>mdi-arrow-left</v-icon>
                Back to Agents
              </v-btn>
            </div>
          </v-card-title>
          
          <v-card-subtitle class="text-body-1">
            Create a fully customized agent with our step-by-step wizard
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
    
    <v-row>
      <v-col cols="12">
        <template-customization-wizard />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import TemplateCustomizationWizard from '../../components/templates/TemplateCustomizationWizard.vue';

const router = useRouter();

function goBack() {
  router.push('/agents');
}
</script>
