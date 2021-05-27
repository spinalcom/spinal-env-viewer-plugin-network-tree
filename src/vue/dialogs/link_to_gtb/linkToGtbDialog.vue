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
            :isAutomate="isAutomate"
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
            class="state"
            v-else-if="pageSelected === PAGES.loading"
         >
            <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
         </div>

         <div
            class="state"
            v-else-if="pageSelected === PAGES.error"
         >
            <md-icon class="md-size-5x">error_outline</md-icon>
         </div>

         <div
            class="state"
            v-else-if="pageSelected === PAGES.success"
         >
            <md-icon class="md-size-5x">done</md-icon>
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
import { bimObjectManagerService } from "spinal-env-viewer-bim-manager-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";

// import linkAutomateToBmsDeviceUtilities from "../../../js/link_utilities/linkAutomateToBmsDevice";

import { LinkBmsDeviceService } from "spinal-env-viewer-plugin-network-tree-service";

import networkService from "../../../js/network/networkService";

import LinkComponent from "../../components/links/LinkComponent.vue";
import ConfirmLinkToGTB from "./confirmLinkToGTB.vue";
import ConfigurationTemplate from "../../components/links/configuration.vue";

// import { SpinalForgeViewer } from "spinal-env-viewer-plugin-forge";

const lodash = require("lodash");

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
         creation: 3,
         loading: 4,
         success: 5,
         error: 6,
      };

      this.configuration = {
         bimProperty: "CFA_Adresse IP",
         bmsProperty: "address",
      };

      this.bimDevices = [];
      // this.bimDevices = [];

      this.contextId;
      this.nodeId;
      this.callback = undefined;

      return {
         percent: 0,
         title: "",
         result: undefined,
         showDialog: true,
         pageSelected: this.PAGES.selection,
         isAutomate: false,

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
         this.isAutomate = option.isAutomate;

         this.getAllData()
            .then(async () => {
               this.title = "Select context, subnetwork or the bms device";
               this.bimDevices = await this._getAutomates(
                  this.nodeId,
                  this.contextId,
                  this.isAutomate
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
         this.pageSelected = this.PAGES.creation;
         const liste = [...this.result.valids];
         this.createLinkProm(liste, this.contextSelected, liste.length)
            .then(() => {
               this.pageSelected = this.PAGES.success;
            })
            .catch((err) => {
               console.error(err);
               this.pageSelected = this.PAGES.error;
            });
      },

      createLinkProm(liste, contextId, listeLenth) {
         // const promises = this.result.valids.map((el) => {
         //    return linkAutomateToBmsDeviceUtilities.LinkBmsDeviceToBimDevices(
         //       this.contextSelected,
         //       el.profileItem.id,
         //       el.automateItem.id
         //    );
         // });

         // return Promise.all(promises)
         //    .then(() => {
         //       this.pageSelected = this.PAGES.success;
         //    })
         //    .catch((err) => {
         //       console.error(err);
         //       this.pageSelected = this.PAGES.error;
         //    });

         return new Promise((resolve, reject) => {
            this.createLinkRec(liste, contextId, listeLenth, resolve);
         });
      },

      createLinkRec(liste, contextId, listeLenth, resolve) {
         const item = liste.shift();
         if (item) {
            // linkAutomateToBmsDeviceUtilities
            LinkBmsDeviceService.LinkBmsDeviceToBimDevices(
               contextId,
               item.profileItem.id,
               item.automateItem.id
            )
               .then(() => {
                  this.percent = Math.floor(
                     (100 * (listeLenth - liste.length)) / listeLenth
                  );
                  this.createLinkRec(liste, contextId, listeLenth, resolve);
               })
               .catch((err) => {
                  this.percent = Math.floor(
                     (100 * (listeLenth - liste.length)) / listeLenth
                  );
                  this.createLinkRec(liste, contextId, listeLenth, resolve);
               });
         } else {
            resolve(true);
         }
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
               // if (!this.isAutomate) {
               this._goToConfiguration();
               // } else {
               // linkAutomateToBmsDeviceUtilities
               //    .LinkBmsDeviceToBimDevices(
               //       this.contextSelected,
               //       this.deviceSelected,
               //       this.nodeId
               //    )
               //    .then(() => {
               //       this.pageSelected = this.PAGES.success;
               //    })
               //    .catch((err) => {
               //       console.error(err);
               //       this.pageSelected = this.PAGES.error;
               //    });
               // }
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

      async _getResult() {
         this.title = "Edit Link";
         const bmsDevices = this._getBmsDevices();
         const bimDevices = await this.getElementProperties(
            this.bimDevices,
            this.configuration.bimProperty
         );

         const res = {
            valids: [],
            invalidAutomateItems: [...bimDevices.invalidItems],
            invalidProfileItems: [],
         };

         for (const bim of bimDevices.validItems) {
            let index;
            const found = bmsDevices.find((el, i) => {
               if (
                  el[this.configuration.bmsProperty] ==
                  bim.property.displayValue
               ) {
                  index = i;
                  return true;
               }
               return false;
            });

            if (found) {
               bmsDevices.splice(index, 1);
               res.valids.push({ automateItem: bim, profileItem: found });
            } else {
               res.invalidAutomateItems.push(bim);
            }
         }

         res.invalidProfileItems = bmsDevices;
         this.pageSelected = this.PAGES.result;

         this.result = res;
      },

      _getBmsDevices() {
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

      async getElementProperties(argItems, attributeName) {
         const dbIdMap = new Map();
         const promises = [];
         const items = lodash
            .chain(argItems)
            .groupBy("bimFileId")
            .map((value, key) => {
               return {
                  model: window.spinal.BimObjectService.getModelByBimfile(key),
                  selection: value.map((el) => {
                     dbIdMap.set(el.dbid, el.id);
                     return el.dbid;
                  }),
               };
            })
            .value();

         const data = await bimObjectManagerService.getBimObjectProperties(
            items
         );

         for (const item of data) {
            promises.push(
               this._getItemPropertiesFormatted(
                  item.model,
                  item.properties,
                  attributeName
               )
            );
         }

         return Promise.all(promises).then((result) => {
            const resultFlatted = result.flat();

            const res = {
               validItems: [],
               invalidItems: [],
            };

            for (const el of resultFlatted) {
               el.id = dbIdMap.get(el.dbId);
               if (el.property) {
                  res.validItems.push(el);
               } else {
                  res.invalidItems.push(el);
               }
            }

            return res;
         });
      },

      _getItemPropertiesFormatted(model, itemList, attributeName, nodeId) {
         const promises = itemList.map(async (el) => {
            el.model = model;
            el.property = this._getAttributeByName(
               el.properties,
               attributeName
            );

            return el;
         });

         return Promise.all(promises);
      },

      _getAttributeByName(properties, propertyName) {
         return properties.find((obj) => {
            return (
               (obj.displayName === propertyName ||
                  obj.attributeName === propertyName) &&
               obj.displayValue &&
               (obj.displayValue + "").length > 0
            );
         });
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
         /* !this.contextSelected || */
         return (
            (this.isAutomate && !this.deviceSelected) ||
            !this.networkSelected ||
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
   margin: 10px 0;
}

.mdDialogContainer .content .progress-bar .percent-bar {
   width: 90%;
}
</style>

<style>
.mdDialogContainer .md-dialog-container {
   max-width: 100%;
   max-height: 100%;
}
</style>