<template>
   <md-dialog
      class="mdDialogContainer"
      :md-active.sync="showDialog"
      @md-closed="closeDialog(false)"
   >
      <md-dialog-title class="dialogTitle">{{title}}</md-dialog-title>

      <md-dialog-content class="content">
         <link-component
            v-if="pageSelected === PAGES.selection"
            :context_title="'Contexts'"
            :category_title="'Subnetworks'"
            :group_title="'Bms devices'"
            :data="data"
            :profils="networks"
            :devices="devices"
            :contextSelected="contextSelected"
            :profilSelected="networkSelected"
            :deviceSelected="deviceSelected"
            @selectContext="selectContext"
            @selectProfil="selectNetwork"
            @selectDevice="selectDevice"
         ></link-component>

         <configuration-template
            v-else-if="pageSelected === PAGES.configuration"
            :properties="configuration"
         ></configuration-template>

         <confirm-link
            v-else-if="pageSelected === PAGES.result"
            :data="result"
         ></confirm-link>

         <div
            class="loading"
            v-else-if="pageSelected === PAGES.loading"
         >
            <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
         </div>

         <div
            class="loading"
            v-else-if="pageSelected === PAGES.error"
         >
            <md-icon class="md-size-5x">error_outline</md-icon>
         </div>

         <div
            class="loading"
            v-else-if="pageSelected === PAGES.success"
         >
            <md-icon class="md-size-5x">done</md-icon>
         </div>

      </md-dialog-content>

      <md-dialog-actions>
         <md-button
            class="md-primary"
            @click="closeDialog(false)"
         >Close</md-button>

         <md-button
            class="md-primary"
            :disabled="disabledPreviousButton()"
            @click="goToPrevious"
         >Previous</md-button>

         <md-button
            class="md-primary"
            :disabled="disabledNextButton()"
            @click="goToNext"
         >Next</md-button>

         <md-button
            :disabled="disabledLinkButton()"
            class="md-primary"
            @click="createLink"
         >Link</md-button>
      </md-dialog-actions>

   </md-dialog>

</template>

<script>
import networkService from "../../../js/network/networkService";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import LinkComponent from "../../components/links/LinkComponent.vue";
import ConfirmLinkToGTB from "./confirmLinkToGTB.vue";
import ConfigurationTemplate from "../../components/links/configuration.vue";

import linkAutomateToBmsDeviceUtilities from "../../../js/link_utilities/linkAutomateToBmsDevice";
export default {
   name: "linkToGtbDialog",
   components: {
      "link-component": LinkComponent,
      "confirm-link": ConfirmLinkToGTB,
      "configuration-template": ConfigurationTemplate,
   },
   props: ["onFinised"],
   data() {
      this.PAGES = {
         selection: 0,
         configuration: 1,
         result: 2,
         loading: 3,
         success: 4,
         error: 5,
      };

      this.configuration = {
         bimProperty: "",
         bmsProperty: "",
      };

      this.bmsDevices = [];
      // this.bimDevices = [];

      this.contextId;
      this.nodeId;
      this.callback = undefined;

      return {
         title: "",
         result: undefined,
         showDialog: true,
         pageSelected: this.PAGES.selection,

         data: [],
         networks: [],
         devices: [],

         contextSelected: undefined,
         networkSelected: undefined,
         deviceSelected: undefined,
      };
   },
   methods: {
      opened(option) {
         this.pageSelected = this.PAGES.loading;

         this.contextId = option.contextId;
         this.nodeId = option.nodeId;

         this.getAllData()
            .then(async () => {
               this.title = "Select context, subnetwork or the bms device";
               this.bmsDevices = await this._getAutomates(
                  this.nodeId,
                  this.contextId
               ).then((result) => result.map((el) => el.get()));
               this.pageSelected = this.PAGES.selection;
            })
            .catch((err) => {
               this.pageSelected = this.PAGES.error;
            });
      },

      removed(save) {
         if (save) {
         }
         this.showDialog = false;
      },

      closeDialog(closeResult) {
         if (typeof this.onFinised === "function") {
            this.onFinised(closeResult);
         }
      },

      createLink() {
         this.pageSelected = this.PAGES.loading;

         const promises = this.result.valids.map((el) => {
            return linkAutomateToBmsDeviceUtilities.LinkBmsDeviceToBimDevices(
               this.contextSelected,
               el.profileItem.id,
               el.automateItem.id
            );
         });

         return Promise.all(promises)
            .then(() => {
               this.pageSelected = this.PAGES.success;
            })
            .catch((err) => {
               console.error(err);
               this.pageSelected = this.PAGES.error;
            });
      },

      _getAutomates(selectionNodeId, contextId) {
         return SpinalGraphService.findInContext(
            selectionNodeId,
            contextId,
            (node) => {
               if (node.info.isAutomate && node.info.isAutomate.get()) {
                  SpinalGraphService._addNode(node);
                  return true;
               }

               return false;
            }
         );
      },

      getAllData() {
         return networkService
            .getDeviceContextTreeStructure()
            .then((result) => {
               this.data = result;
               this.updateNetworks();
            });
      },

      /* Selection */
      selectContext(id) {
         this.contextSelected = id;
      },

      selectNetwork(id) {
         this.networkSelected = id;
      },

      selectDevice(id) {
         this.deviceSelected = id;
      },

      /* Update */
      updateNetworks() {
         this.networks = [];
         if (this.contextSelected) {
            let val = this.data.find((el) => el.id === this.contextSelected);
            if (val) this.networks = val.networks;
         }
      },

      updateDevices() {
         this.devices = [];
         if (this.networkSelected) {
            let val = this.networks.find(
               (el) => el.id === this.networkSelected
            );
            if (val) this.devices = val.devices;
         }
      },

      goToNext() {
         const currentPage = this.pageSelected;
         this.pageSelected = this.PAGES.loading;

         switch (currentPage) {
            case this.PAGES.selection:
               this._goToConfiguration();
               break;
            case this.PAGES.configuration:
               this._getResult();
               break;

            default:
               break;
         }
      },

      goToPrevious() {
         const currentPage = this.pageSelected;
         this.pageSelected = this.PAGES.loading;

         switch (currentPage) {
            case this.PAGES.result:
               this.pageSelected = this.PAGES.configuration;
               break;
            case this.PAGES.configuration:
               this.pageSelected = this.PAGES.selection;
               break;

            default:
               break;
         }
      },

      _goToConfiguration() {
         this.title = "Configuration";
         this.pageSelected = this.PAGES.configuration;
      },

      _getResult() {
         const bimDevices = this._getBimDevices();

         const res = {
            valids: [],
            invalidAutomateItems: [],
            invalidProfileItems: [],
         };

         res.invalidAutomateItems = this.bmsDevices;
         res.invalidProfileItems = bimDevices;

         this.title = "Edit Link";
         this.pageSelected = this.PAGES.result;

         this.result = res;
      },

      _getBimDevices() {
         if (typeof this.deviceSelected !== "undefined") {
            return this.devices.filter((el) => el.id === this.deviceSelected);
         } else if (typeof this.networkSelected !== "undefined") {
            const found = this.networks.find(
               (el) => el.id === this.networkSelected
            );
            return found && found.devices ? found.devices : [];
         } else if (typeof this.contextSelected !== "undefined") {
            const devices = [];
            const found = this.data.find(
               (el) => el.id === this.contextSelected
            );

            if (found && found.networks) {
               for (const network of found.networks) {
                  if (network.devices) {
                     devices.push(...network.devices);
                  }
               }
            }

            return devices;
         }
      },

      /* Disabled */

      disabledPreviousButton() {
         return (
            this.pageSelected === this.PAGES.loading ||
            this.pageSelected === this.PAGES.selection ||
            this.pageSelected === this.PAGES.success
         );
      },

      disabledNextButton() {
         return (
            !this.contextSelected ||
            this.pageSelected === this.PAGES.loading ||
            this.pageSelected === this.PAGES.result ||
            this.pageSelected === this.PAGES.success
         );
      },

      disabledLinkButton() {
         return (
            this.pageSelected === this.PAGES.loading ||
            this.pageSelected !== this.PAGES.result ||
            this.pageSelected === this.PAGES.success ||
            this.pageSelected === this.PAGES.error
         );
      },
   },
   watch: {
      async contextSelected() {
         await this.updateNetworks();
         this.networkSelected = undefined;
      },

      async networkSelected() {
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
</style>