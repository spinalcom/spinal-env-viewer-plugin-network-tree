<template>
   <md-list>
      <md-list-item>
         <md-field>
            <label>Attribute</label>
            <md-input v-model="config.attributeName"></md-input>
         </md-field>
      </md-list-item>
      <md-list-item>
         <md-radio
            v-model="config.useAttrValue"
            :value="true"
            class="md-primary"
         >Use attribute value</md-radio>
      </md-list-item>

      <md-list-item>
         <md-radio
            v-model="config.useAttrValue"
            disabled
            :value="false"
            class="md-primary"
         ><a @click="personalized">Personalized</a></md-radio>
      </md-list-item>

   </md-list>

</template>
<script>
import { spinalPanelManagerService } from "spinal-env-viewer-panel-manager-service";

export default {
   name: "namingConventionStep",
   props: {
      config: {},
   },
   data() {
      return {};
   },
   methods: {
      personalized() {
         spinalPanelManagerService.openPanel("personalizeNamingConvention", {
            config: this.config,
            callback: (argFunction) => {
               this.config.useAttrValue = false;
               this.config.personalized.callback = argFunction;
            },
         });
      },
   },
};
</script>
<style scoped>
</style>