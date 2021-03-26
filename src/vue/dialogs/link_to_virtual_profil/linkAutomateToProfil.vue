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
               v-for="item in resultMaps.values()"
               class="result-component"
               :ref="`result-${item.automate.id}`"
               :key="item.automate.id"
               :results="item"
               @edit="editAutomateLinks"
            >
            </result-component>
         </md-content>

         <div
            class="loading"
            v-else-if="pageSelected === PAGES.loading"
         >
            <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
         </div>

         <div
            class="loading"
            v-else-if="pageSelected === PAGES.success"
         >
            <md-icon class="md-size-5x">done</md-icon>
         </div>

         <div
            class="loading"
            v-else-if="pageSelected === PAGES.error"
         >
            <md-icon class="md-size-5x">error_outline</md-icon>
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
         success: 3,
         error: 4,
      };

      // this.validMaps = new Map();
      // this.invalidMaps = new Map();

      return {
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
      opened(option) {
         // this.physicalContextId = option.contextId;
         // // this.physicalProfilId = option.nodeId;
         // this.automates = option.automates;
         this.pageSelected = this.PAGES.loading;

         this.physicalParams = option;
         this.callback = option.callback;

         this.getAllData().then(() => {
            this.pageSelected = this.PAGES.selection;
         });
      },

      removed(option) {
         this.showDialog = false;
      },

      createLinks() {
         this.pageSelected = this.PAGES.loading;
         return linkAutomateToProfilUtilities
            .linkNodes(this.resultMaps, this.deviceSelected)
            .then((result) => {
               this.pageSelected = this.PAGES.success;
            })
            .catch((err) => {
               console.error(err);
               this.pageSelected = this.PAGES.error;
            });
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
         return !(this.contextSelected && this.profilSelected);
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

         this.createMaps(virtualItems);
      },

      createMaps(virtualItems) {
         return linkAutomateToProfilUtilities
            .createMaps(this.physicalParams.automates, virtualItems)
            .then((resultMap) => {
               this.resultMaps = resultMap;
               this.pageSelected = this.PAGES.result;
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

.mdDialogContainer .content .loading {
   width: 100%;
   height: 100%;
   display: flex;
   justify-content: center;
   align-items: center;
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