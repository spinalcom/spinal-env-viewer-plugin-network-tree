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
   <md-dialog
      class="mdDialogContainer"
      :md-active.sync="showDialog"
      @md-closed="closeDialog(false)"
   >
      <md-dialog-title class="dialogTitle">Link Automates to Profil
      </md-dialog-title>
      <md-dialog-content class="content">
         <link-component
            v-if="pageSelected === PAGES.selection"
            :context_title="'Profils'"
            :category_title="'Categories'"
            :group_title="'Devices'"
            :data="data"
            :profils="profils"
            :devices="devices"
            :contextSelected="contextSelected"
            :profilSelected="profilSelected"
            :deviceSelected="deviceSelected"
            @selectContext="selectContext"
            @selectProfil="selectProfil"
            @selectDevice="selectDevice"
         ></link-component>

         <md-content
            class="results md-scrollbar"
            v-else-if="pageSelected === PAGES.result"
         >
            <result-component
               v-for="item in linkResult"
               class="result-component"
               :ref="`result-${item.automate.id}`"
               :key="item.automate.id"
               :results="item"
               @edit="editAutomateLinks"
            >
            </result-component>
         </md-content>

         <div
            class="state"
            v-else-if="pageSelected === PAGES.loading"
         >
            <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
         </div>

         <div
            class="state"
            v-else-if="pageSelected === PAGES.success"
         >
            <md-icon class="md-size-5x">done</md-icon>
         </div>

         <div
            class="state"
            v-else-if="pageSelected === PAGES.error"
         >
            <md-icon class="md-size-5x">error_outline</md-icon>
         </div>

         <div
            class="progress-bar"
            v-else-if="pageSelected === PAGES.creation"
         >
            <div class="percent-number">{{percent}} %</div>
            <md-progress-bar
               class="percent-bar"
               md-mode="buffer"
               :md-value="percent"
            ></md-progress-bar>
         </div>

      </md-dialog-content>

      <md-dialog-actions>
         <md-button
            class="md-primary"
            @click="closeDialog(false)"
         >Close</md-button>

         <md-button
            class="md-primary"
            :disabled="disabled()"
            v-if="pageSelected === PAGES.selection"
            @click="goToNext"
         >Next</md-button>

         <md-button
            class="md-primary"
            v-if="pageSelected === PAGES.result"
            @click="goToPreviousStep"
         >Previous</md-button>

         <md-button
            class="md-primary"
            v-if="pageSelected === PAGES.result"
            @click="createLinks"
         >Save</md-button>

      </md-dialog-actions>
   </md-dialog>

</template>

<script>
import EventBus from "spinal-env-viewer-room-manager/js/event";
import deviceProfilService from "../../../js/devices_profil_services";
import linkAutomateToProfilUtilities from "../../../js/link_utilities/linkAutomateToProfil";

import LinkComponent from "../../components/links/LinkComponent.vue";
import ResultComponent from "../../components/links/resultComponent.vue";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { BIM_OBJECT_TYPE } from "spinal-env-viewer-plugin-forge/dist/Constants";

export default {
   name: "dialogComponent",
   components: {
      "link-component": LinkComponent,
      "result-component": ResultComponent,
   },
   props: ["onFinised"],
   data() {
      this.physicalParams;

      this.PAGES = {
         selection: 0,
         result: 1,
         loading: 2,
         creation: 3,
         success: 4,
         error: 5,
      };

      // this.validMaps = new Map();
      // this.invalidMaps = new Map();

      return {
         percent: 0,
         resultMaps: new Map(),
         showDialog: true,
         pageSelected: this.PAGES.selection,

         data: [],
         profils: [],
         devices: [],

         contextSelected: undefined,
         profilSelected: undefined,
         deviceSelected: undefined,
         callback: undefined,
      };
   },

   mounted() {
      EventBus.$on("itemCreated", (id) => {
         this.pageSelected = this.PAGES.loading;

         this.getAllData().then(() => {
            this.pageSelected = this.PAGES.selection;
         });
      });
   },

   methods: {
      async opened(option) {
         // this.physicalContextId = option.contextId;
         // // this.physicalProfilId = option.nodeId;
         // this.automates = option.automates;
         this.pageSelected = this.PAGES.loading;

         this.callback = option.callback;

         Promise.all([
            this.getAllData(),
            this.getAutomates(option.contextId, option.nodeId),
         ]).then(([data, automates]) => {
            this.physicalParams = {
               contextId: option.contextId,
               automates: automates.map((el) => el.get()),
            };
            this.pageSelected = this.PAGES.selection;
         });
      },

      removed(option) {
         this.showDialog = false;
      },

      getAutomates(contextId, nodeId) {
         const nodeInfo = SpinalGraphService.getInfo(nodeId);
         if (
            nodeInfo.type.get() === BIM_OBJECT_TYPE &&
            nodeInfo.isAutomate &&
            nodeInfo.isAutomate.get()
         ) {
            return Promise.resolve([nodeInfo]);
         }

         return SpinalGraphService.findInContext(nodeId, contextId, (node) => {
            if (
               node.getType().get() === BIM_OBJECT_TYPE &&
               node.info.isAutomate &&
               node.info.isAutomate.get()
            ) {
               SpinalGraphService._addNode(node);
               return true;
            }
            return false;
         });
      },

      createLinks() {
         this.pageSelected = this.PAGES.creation;
         const liste = Array.from(this.resultMaps.keys()).map((key) => {
            return [key, this.resultMaps.get(key)];
         });

         this.linkNode(liste, this.deviceSelected, liste.length)
            .then(() => {
               this.pageSelected = this.PAGES.success;
            })
            .catch((err) => {
               console.error(err);
               this.pageSelected = this.PAGES.error;
            });

         // return linkAutomateToProfilUtilities
         //    .linkNodes(this.resultMaps, this.deviceSelected)
         //    .then((result) => {
         //       this.pageSelected = this.PAGES.success;
         //    })
         //    .catch((err) => {
         //       console.error(err);
         //       this.pageSelected = this.PAGES.error;
         //    });
      },

      linkNode(liste, deviceProfilId, listeLength) {
         return new Promise((resolve, reject) => {
            this.linkNodeRecur(liste, deviceProfilId, listeLength, resolve);
         });
      },

      linkNodeRecur(liste, deviceProfilId, listeLength, resolve) {
         const item = liste.shift();
         if (item) {
            const [key, value] = item;
            linkAutomateToProfilUtilities
               .linkProfilToDevice(key, deviceProfilId, value.valids)
               .then(() => {
                  this.percent = Math.floor(
                     (100 * (listeLength - liste.length)) / listeLength
                  );

                  this.linkNodeRecur(
                     liste,
                     deviceProfilId,
                     listeLength,
                     resolve
                  );
               })
               .catch(() => {
                  this.percent = Math.floor(
                     (100 * (listeLength - liste.length)) / listeLength
                  );

                  this.linkNodeRecur(
                     liste,
                     deviceProfilId,
                     listeLength,
                     resolve
                  );
               });
         } else {
            resolve(true);
         }
      },

      closeDialog(closeResult) {
         if (typeof this.onFinised === "function") {
            this.onFinised(closeResult);
         }
      },

      getAllData() {
         return deviceProfilService
            .getDeviceContextTreeStructure()
            .then((result) => {
               this.data = result;
               this.updateProfils();
               return;
            });
      },

      disabled() {
         return !(this.contextSelected && this.deviceSelected);
      },

      getItemsList(deviceId) {
         const found = this.devices.find((el) => el.id === deviceId);
         if (found) return found.itemList;
      },

      /* Selection */
      selectContext(id) {
         this.contextSelected = id;
      },

      selectProfil(id) {
         this.profilSelected = id;
      },

      selectDevice(id) {
         this.deviceSelected = id;
      },

      /* Update */
      updateProfils() {
         this.categories = [];
         if (this.contextSelected) {
            let val = this.data.find((el) => el.id === this.contextSelected);
            if (val) this.profils = val.profils;
         }
      },

      updateDevices() {
         this.devices = [];
         if (this.profilSelected) {
            let val = this.profils.find((el) => el.id === this.profilSelected);
            if (val) this.devices = val.devices;
         }
      },

      /* Change Step */

      goToPreviousStep() {
         this.pageSelected = this.PAGES.selection;
      },

      goToNext() {
         this.pageSelected = this.PAGES.loading;
         const virtualItems = this.getItemsList(this.deviceSelected);
         return this.createMaps(virtualItems)
            .then(() => {
               this.pageSelected = this.PAGES.result;
            })
            .catch((err) => {
               this.pageSelected = this.PAGES.error;
            });
      },

      createMaps(virtualItems) {
         return linkAutomateToProfilUtilities
            .createMaps(this.physicalParams.automates, virtualItems)
            .then((resultMap) => {
               this.resultMaps = resultMap;
            });
      },

      /** */
      editAutomateLinks(res) {
         const keysIterator = this.resultMaps.keys();
         let processing = true;
         let next;

         do {
            next = keysIterator.next().value;
            if (typeof next === "undefined") {
               processing = false;
            } else if (next === res.automateId) {
               // console.log(next, res.automateId);
               this.resultMaps.set(next, res.value);
               // console.log(this.resultMaps);
               this.$forceUpdate();
               // const reference = this.$refs[`result-${res.automateId}`][0];
               // reference.forceRerender();
               processing = false;
            }
         } while (processing);
      },
   },
   computed: {
      linkResult() {
         return Array.from(this.resultMaps.values());
      },
   },
   watch: {
      async contextSelected() {
         await this.updateProfils();
         this.profilSelected = undefined;
      },
      async profilSelected() {
         this.updateDevices();
         this.deviceSelected = undefined;
      },
   },
};
</script>

<style scoped>
.mdDialogContainer {
   width: 60%;
   height: 600px;
}

.mdDialogContainer .dialogTitle {
   text-align: center;
}

.mdDialogContainer .content {
   padding: 0 10px 24px 24px;
}

.mdDialogContainer .content .state {
   width: 100%;
   height: 100%;
   display: flex;
   justify-content: center;
   align-items: center;
}

.mdDialogContainer .content .progress-bar {
   width: 100%;
   height: 100%;
   display: flex;
   flex-direction: column;
   align-items: center;
   justify-content: center;
}

.mdDialogContainer .content .progress-bar .percent-number {
   font-size: 1.8em;
   margin-bottom: 10px;
}

.mdDialogContainer .content .progress-bar .percent-bar {
   width: 90%;
}

.mdDialogContainer .content .results {
   width: 100%;
   height: 100%;
   /* display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  overflow: auto; */
}

.mdDialogContainer .content .results .result-component {
   width: 100%;
   height: 70px;
   border: 1px solid gray;
   margin: 5px 0 5px 0;
}

/* .mdDialogContainer .content {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
}

.mdDialogContainer .content .section {
  width: 33%;
  border: 1px solid grey;
  border-radius: 4% 4% 0 0;
  padding: 15px;
} */

/* .mdIcon {
  display: flex;
  align-items: center;
} */
</style>