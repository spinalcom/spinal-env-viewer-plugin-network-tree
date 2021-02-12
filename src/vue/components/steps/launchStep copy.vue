<!--
Copyright 2020 SpinalCom - www.spinalcom.com
This file is part of SpinalCore.
Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.
This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.
If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
   <div class="content">
      <div
         class="buttons"
         v-if="appState === STATES.normal"
      >
         <md-button
            v-if="!verified"
            :disabled="disableVerificationButton"
            class="md-raised md-primary"
            @click="launchVerification"
         >
            Verify
         </md-button>

         <div v-else-if="verified">
            <div>
               <div class="resultVerification">
                  Valid item(s) :
                  {{ equipementsVerificationResult.validItems.length }}
               </div>
               <div class="resultVerification">
                  invalid item(s) :
                  {{ equipementsVerificationResult.invalidItems.length }}
               </div>
            </div>

            <md-button
               :disabled="error"
               class="md-raised md-primary"
               @click="launchGeneration"
            >Launch Generation</md-button>
         </div>
      </div>

      <div
         class="state"
         v-else-if="appState === STATES.loading"
      >
         <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
      </div>

      <div
         class="state"
         v-else-if="appState === STATES.success"
      >
         <md-icon class="md-size-4x">check</md-icon>
      </div>

      <div
         class="state"
         v-else-if="appState === STATES.error"
      >
         <md-icon class="md-size-4x">close</md-icon>
      </div>
   </div>
</template>

<script>
// import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import generateAutomateService from "../../../js/generateAutomateService";

export default {
   name: "launchGeneration",
   props: {
      automates: {},
      equipments: {},
      attribute: {},
      error: {},
      contextId: {},
      selectedNodeId: {},
      changed: {},
   },
   data() {
      this.STATES = {
         loading: 1,
         normal: 2,
         success: 3,
         error: 4,
      };
      this.automatesVerificationResult = {};
      this.equipementsVerificationResult = {};

      return {
         verified: false,
         valueGrouped: null,
         appState: this.STATES.normal,
      };
   },
   methods: {
      async launchVerification() {
         this.appState = this.STATES.loading;

         await this.formatData().then((result) => {
            this.automatesVerificationResult = result.automatesProperties;
            this.equipementsVerificationResult = result.equipementsProperties;

            this.verified = true;
            this.appState = this.STATES.normal;
            this.$emit("verified");
         });
      },

      async launchGeneration() {
         this.appState = this.STATES.loading;

         const automateValid = this.automatesVerificationResult.validItems;
         const equipmentsValid = this.equipementsVerificationResult.validItems;

         const separator = this.attribute.separator;
         const indice = this.attribute.indice;

         return generateAutomateService
            .createTree(
               this.contextId,
               this.selectedNodeId,
               automateValid,
               equipmentsValid,
               separator,
               indice
            )
            .then((result) => {
               this.appState = this.STATES.success;

               // setTimeout(() => {
               //   this.appState = this.STATES.normal;
               //   this.verified = false;
               // }, 1000);
            })
            .catch((err) => {
               console.error(err);
               this.appState = this.STATES.error;

               setTimeout(() => {
                  this.appState = this.STATES.normal;
                  this.verified = false;
               }, 1000);
            });
      },

      _displayResult(result) {
         this.appState = result;
         setTimeout(() => {
            this.appState = this.STATES.normal;
         }, 1000);
      },

      formatData() {
         const promises = [
            generateAutomateService.getElementProperties(
               this.automates,
               this.attribute.attributeName
            ),
            generateAutomateService.getElementProperties(
               this.equipments,
               this.attribute.attributeName
            ),
         ];

         return Promise.all(promises).then((result) => {
            return {
               automatesProperties: result[0],
               equipementsProperties: result[1],
            };
         });
      },
   },
   computed: {
      disableVerificationButton() {
         return this.automates.length === 0 || this.equipments.length === 0;
      },
   },
   watch: {
      changed() {
         if (this.changed) {
            this.appState = this.STATES.normal;
            this.verified = false;
         }
      },
      // attribute() {
      //   this.verified = false;
      // }
   },
};
</script>

<style scoped>
.content {
   width: 100%;
   height: 100%;
}
.content .buttons {
   width: 100%;
   display: flex;
   justify-content: center;
}
.state {
   width: 100%;
   height: 100%;
   display: flex;
   justify-content: center;
   align-items: center;
}
</style>
