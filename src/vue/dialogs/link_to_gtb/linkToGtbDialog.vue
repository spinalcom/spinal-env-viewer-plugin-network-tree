<!--
Copyright 2021 SpinalCom - www.spinalcom.com

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
  <md-dialog class="mdDialogContainer"
             :md-active.sync="showDialog"
             @md-closed="closeDialog(false)">
    <md-dialog-title class="dialogTitle">{{title}}</md-dialog-title>

    <md-dialog-content class="content">
      <link-component v-if="pageSelected === PAGES.selection"
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
                      @selectDevice="selectDevice"></link-component>

      <configuration-template v-else-if="pageSelected === PAGES.configuration"
                              :properties="configuration"
                              :bimData="configuration.bimData"
                              :bmsData="configuration.bmsData">
      </configuration-template>

      <confirm-link v-else-if="pageSelected === PAGES.result"
                    :data="result"></confirm-link>

      <div class="state"
           v-else-if="pageSelected === PAGES.loading">
        <md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
      </div>

      <div class="state"
           v-else-if="pageSelected === PAGES.error">
        <md-icon class="md-size-5x">error_outline</md-icon>
      </div>

      <div class="state"
           v-else-if="pageSelected === PAGES.success">
        <md-icon class="md-size-5x">done</md-icon>
      </div>

      <div class="progress-bar"
           v-else-if="pageSelected === PAGES.creation">
        <div class="percent-number">{{percent}} %</div>
        <md-progress-bar class="percent-bar"
                         md-mode="buffer"
                         :md-value="percent"></md-progress-bar>
      </div>

    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary"
                 @click="closeDialog(false)">Close</md-button>

      <md-button class="md-primary"
                 :disabled="disabledPreviousButton()"
                 @click="goToPrevious">Previous</md-button>

      <md-button class="md-primary"
                 :disabled="disabledNextButton()"
                 @click="goToNext">Next</md-button>

      <md-button :disabled="disabledLinkButton()"
                 class="md-primary"
                 @click="createLink">Link</md-button>
    </md-dialog-actions>

  </md-dialog>

</template>

<script>
import linkBimToBmsControllers from "../../../js/controllers/links/linkBimToBmsControllers";
// import linkAutomateToBmsDeviceUtilities from "../../../js/link_utilities/linkAutomateToBmsDevice";

import {
  AttributesUtilities,
  LinkBmsDeviceService,
} from "spinal-env-viewer-plugin-network-tree-service";

import networkService from "../../../js/network/networkService";

import LinkComponent from "../../components/links/LinkComponent.vue";
import ConfirmLinkToGTB from "./confirmLinkToGTB.vue";
import ConfigurationTemplate from "../../components/links/configuration.vue";

import bmsDataFunction from "../../../js/personalized_functions/replace_by";
import bimDataFunction from "../../../js/personalized_functions/replace-by";
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

    this.bimDevices = [];

    this.contextId;
    this.nodeId;
    this.callback = undefined;

    return {
      configuration: {
        bimData: {
          property: "CFA_Repère d'équipement",
          useFunction: false,
          callback: { code: bimDataFunction },
        },
        bmsData: {
          property: "name",
          useFunction: false,
          callback: { code: bmsDataFunction },
        },

        useTheseAttributes: false,
      },

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

      this.loadData()
        .then((result) => {
          this.updateNetworks();
          this.title = "Select context, subnetwork or the bms device";
          this.pageSelected = this.PAGES.selection;
        })
        .catch((err) => {
          console.error(err);
          this.pageSelected = this.PAGES.error;
        });

      // this.getDeviceContextTreeStructure()
      //   .then(async () => {
      //     this.title = "Select context, subnetwork or the bms device";
      //     this.bimDevices = await this._getAutomates(
      //       this.nodeId,
      //       this.contextId,
      //       this.isAutomate
      //     );
      //     this.pageSelected = this.PAGES.selection;
      //   })
      //   .catch((err) => {
      //     this.pageSelected = this.PAGES.error;
      //   });
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

    async createLink() {
      this.pageSelected = this.PAGES.creation;

      return (() => {
        if (!this.configuration.useTheseAttributes)
          return this._useProfileToLink();
        return this._useAttributeToLink();
      })()
        .then(() => {
          this.pageSelected = this.PAGES.success;
        })
        .catch((err) => {
          console.error(err);
          this.pageSelected = this.PAGES.error;
        });
    },

    _useProfileToLink() {
      return linkBimToBmsControllers.createLinkBetweenBimAndBms(
        this.contextSelected,
        this.result.valids,
        this.percent
      );
    },

    _useAttributeToLink() {
      return linkBimToBmsControllers.createLinkBetweenBimAndBmsUsingAttribute(
        this.contextSelected,
        this.result.valids,
        this.percent
      );
    },

    loadData() {
      const bmsTreeProm =
        linkBimToBmsControllers.getBmsDevicesContextTreeStructure();
      const automateBimsProm = linkBimToBmsControllers.getAutomateBims(
        this.nodeId,
        this.contextId
      );
      return Promise.all([bmsTreeProm, automateBimsProm]).then(
        ([data, automatesBims]) => {
          this.data = data;
          this.bimDevices = automatesBims;
        }
      );
    },

    goToNext() {
      const currentPage = this.pageSelected;
      this.pageSelected = this.PAGES.loading;

      switch (currentPage) {
        case this.PAGES.selection:
          this._goToConfiguration();
          break;
        case this.PAGES.configuration:
          this._getResult().catch((error) => {
            console.error(error);
            this.pageSelected = this.PAGES.error;
          });
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

      // const bmsDevices = await this._getBmsDevicesProperties(
      //   this.configuration.bmsData.property
      // );

      // const bimDevices = await this.getElementProperties(
      //   this.bimDevices,
      //   this.configuration.bimData.property
      // );

      const bmsAttributeName = this.configuration.bmsData.property;
      const bimAttributeName = this.configuration.bimData.property;
      const listObj = {
        devices: this.devices,
        networks: this.networks,
        tree: this.data,
      };

      linkBimToBmsControllers
        .getLinkResultBetweenBimAndBms(
          bmsAttributeName,
          this.contextSelected,
          this.networkSelected,
          this.deviceSelected,
          listObj,
          this.bimDevices,
          bimAttributeName,
          this.configuration
        )
        .then((res) => {
          this.pageSelected = this.PAGES.result;
          this.result = res;
        })
        .catch((err) => {
          console.error(err);
          this.pageSelected = this.PAGES.err;
        });
    },

    // _getBmsDevicesProperties(attributeName) {
    //   const devices = this._getBmsDevices();
    //   return linkBimToBmsControllers._getBmsDevicesProperties(
    //     attributeName,
    //     devices
    //   );
    // },

    // _getBmsDevices() {
    //   if (typeof this.deviceSelected !== "undefined") {
    //     return this.devices.filter((el) => el.id === this.deviceSelected);
    //   } else if (typeof this.networkSelected !== "undefined") {
    //     const found = this.networks.find(
    //       (el) => el.id === this.networkSelected
    //     );
    //     return found && found.devices ? found.devices : [];
    //   } else if (typeof this.contextSelected !== "undefined") {
    //     const devices = [];
    //     const found = this.data.find((el) => el.id === this.contextSelected);

    //     if (found && found.networks) {
    //       for (const network of found.networks) {
    //         if (network.devices) {
    //           devices.push(...network.devices);
    //         }
    //       }
    //     }

    //     return devices;
    //   }
    // },

    // _formatBimProperty(bim) {
    //   if (this.configuration.bimData.useFunction) {
    //     return this._formatValue(
    //       bim.property.displayValue,
    //       this.configuration.bimData.callback.code
    //     );
    //   }

    //   return bim.property.displayValue;
    // },

    // _formatBmsProperty(bms) {
    //   if (this.configuration.bmsData.useFunction) {
    //     return this._formatValue(
    //       bms.property.displayValue,
    //       this.configuration.bmsData.callback.code
    //     );
    //   }
    //   return bms.property.displayValue;
    // },

    // _formatValue(value, callback) {
    //   return eval(`(${callback})('${value}')`);
    // },

    // will be change
    // getElementProperties(argItems, attributeName) {
    //   const dbIdMap = new Map();
    //   const promises = argItems.map(async (el) => {
    //     const fileName = spinal.spinalGraphService
    //       .getInfo(el.bimFileId)
    //       .name.get();

    //     const model = window.spinal.BimObjectService.getModelByName(fileName);

    //     if (!model) throw "make sure your load all scene";

    //     el.property = await AttributesUtilities.findAttribute(
    //       model,
    //       el.dbid,
    //       attributeName
    //     );
    //     return el;
    //   });

    //   try {
    //     return Promise.all(promises).then((result) => {
    //       return {
    //         validItems: result.filter((el) => el.property),
    //         invalidItems: result.filter((el) => !el.property),
    //       };
    //     });
    //   } catch (error) {
    //     throw error;
    //   }
    // },

    // _getItemPropertiesFormatted(model, itemList, attributeName, nodeId) {
    //    const promises = itemList.map(async (el) => {
    //       el.model = model;
    //       el.property = this._getAttributeByName(
    //          el.properties,
    //          attributeName
    //       );

    //       return el;
    //    });

    //    return Promise.all(promises);
    // },

    // _getAttributeByName(properties, propertyName) {
    //    return properties.find((obj) => {
    //       return (
    //          (obj.displayName === propertyName ||
    //             obj.attributeName === propertyName) &&
    //          obj.displayValue &&
    //          (obj.displayValue + "").length > 0
    //       );
    //    });
    // },

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
        let val = this.networks.find((el) => el.id === this.networkSelected);
        if (val) this.devices = val.devices;
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
      /* !this.contextSelected || */
      return (
        (this.isAutomate && !this.deviceSelected) ||
        // !this.networkSelected ||
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