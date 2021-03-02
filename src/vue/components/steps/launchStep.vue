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
               <md-button
                  class="resultVerification md-dense md-primary"
                  @click="selectItems(validItems)"
               >
                  Valid item(s) :
                  {{ validItems.length }}
               </md-button>

               <md-button
                  class="resultVerification md-dense md-accent"
                  @click="selectItems(invalidItems)"
               >
                  invalid item(s) :
                  {{ invalidItems.length }}
               </md-button>

            </div>

            <div>
               <md-checkbox
                  v-model="dontCreateEmptyAutomate"
                  class="md-primary"
               >Don't create PLCs which do not control equipment</md-checkbox>

            </div>

            <div>
               <md-button
                  :disabled="error"
                  class="md-raised md-primary"
                  @click="launchGeneration"
               >Launch Generation</md-button>

               <md-button
                  :disabled="error"
                  class="md-raised md-primary"
               >Edit Links</md-button>
            </div>

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
      automatesObj: {},
      equipmentsObj: {},
      attribute: {},
      error: {},
      contextId: {},
      selectedNodeId: {},
      changed: {},
      namingConvention: {},
   },
   data() {
      this.STATES = {
         loading: 1,
         normal: 2,
         success: 3,
         error: 4,
      };
      // this.automatesVerificationResult = {};
      // this.equipementsVerificationResult = {};

      this.tree = [];

      return {
         verified: false,
         valueGrouped: null,
         appState: this.STATES.normal,
         validItems: [],
         invalidItems: [],
         dontCreateEmptyAutomate: true,
      };
   },
   methods: {
      async launchVerification() {
         this.appState = this.STATES.loading;
         this.formatData().then(
            ({ automatesProperties, equipementsProperties }) => {
               // console.log(result);
               generateAutomateService
                  .createTree(
                     automatesProperties,
                     equipementsProperties,
                     this.attribute
                  )
                  .then(({ tree, invalids, valids }) => {
                     this.tree = tree;
                     this.validItems = valids;
                     this.invalidItems = invalids;

                     this.verified = true;
                     this.appState = this.STATES.normal;
                     this.$emit("verified");
                  });

               // this.automatesVerificationResult = result.automatesProperties;
               // this.equipementsVerificationResult = result.equipementsProperties;
               //    this.verified = true;
               //    this.appState = this.STATES.normal;
               //    this.$emit("verified");
            }
         );
      },

      async launchGeneration() {
         this.appState = this.STATES.loading;

         return generateAutomateService
            .createTreeNodes(
               this.contextId,
               this.selectedNodeId,
               this.tree,
               this.dontCreateEmptyAutomate
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
               this.automatesObj.items,
               this.automatesObj.attributeName,
               this.namingConvention
            ),
            generateAutomateService.getElementProperties(
               this.equipmentsObj.items,
               this.equipmentsObj.attributeName,
               this.namingConvention
            ),
         ];

         return Promise.all(promises).then((result) => {
            console.log("result", result);
            return {
               automatesProperties: result[0] && result[0].validItems,
               equipementsProperties: result[1] && result[1].validItems,
            };
         });
      },

      selectItems(argItems) {
         const items = generateAutomateService.classifyDbIdsByModel(argItems);
         window.spinal.ForgeViewer.viewer.impl.selector.setAggregateSelection(
            items
         );
      },
   },
   computed: {
      disableVerificationButton() {
         return (
            (this.automatesObj.items.length === 0 &&
               this.automatesObj.attributeName.trim().length === 0) ||
            (this.equipmentsObj.items.length === 0 &&
               this.equipmentsObj.attributeName.trim().length === 0)
         );
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
