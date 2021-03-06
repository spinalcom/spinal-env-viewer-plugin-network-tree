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
   <div class="sub-content">

      <div class="countdiv">
         {{count}} item(s) selected
      </div>

      <div class="buttons">
         <md-button @click="addSelection">
            <md-icon>add</md-icon>
            <md-tooltip md-delay="300">Add Bim objects selected</md-tooltip>
         </md-button>

         <md-button @click="clearReferential">
            <md-icon>clear</md-icon>
            <md-tooltip md-delay="300">Clear selected</md-tooltip>
         </md-button>

         <md-button @click="showReferential">
            <md-icon>visibility</md-icon>
            <md-tooltip md-delay="300">Show referential</md-tooltip>
         </md-button>
      </div>

      <div>
         <md-field>
            <label>Attribute</label>
            <md-input v-model="config.attributeName"></md-input>
         </md-field>
      </div>

      <div>
         <div v-if="displayResult">
            <md-button
               class="md-dense md-primary"
               @click="selectValidItemsOnModel"
            >
               {{validItems.length}} item(s) is/are valid
            </md-button>

            <md-button
               class="md-dense md-accent"
               @click="selectInvalidItemsOnModel"
            >
               {{invalidItems.length}} item(s) is/are not valid
            </md-button>
         </div>

         <md-button
            v-if="!loadAttributeResult"
            :disabled="displayResult"
            class="md-raised md-primary"
            @click="verifyResult"
         >Verify</md-button>

         <md-progress-spinner
            v-if="loadAttributeResult"
            :md-diameter="30"
            :md-stroke="3"
            md-mode="indeterminate"
         ></md-progress-spinner>
      </div>

   </div>
</template>

<script>
import geographicService from "spinal-env-viewer-context-geographic-service";
import { bimObjectManagerService } from "spinal-env-viewer-bim-manager-service";
// import generateAutomateService from "../../../js/generateAutomateService";

import { GenerateNetworkTreeService } from "spinal-env-viewer-plugin-network-tree-service";

export default {
   name: "selectionStep",
   props: {
      config: {},
   },
   data() {
      return {
         validItems: [],
         invalidItems: [],
         loadAttributeResult: false,
         displayResult: false,
         count: 0,
      };
   },
   methods: {
      async addSelection() {
         await this.addItemSelected();
         this.changeItemCount();
         this.displayResult = false;
         this.$emit("changed");
      },

      clearReferential() {
         this.config.items = [];
         this.changeItemCount();
         this.displayResult = false;
         this.$emit("changed");

         // this.changeItemCount();

         //  this.$emit("clear");
      },

      async addItemSelected() {
         const aggregateSelection = window.spinal.ForgeViewer.viewer.getAggregateSelection();

         if (aggregateSelection.length === 0) {
            window.alert("no bim object selected");
            return;
         }

         const selection = await this.getLeafDbIds(aggregateSelection);

         for (const element of selection) {
            this.addItemToList(element);
         }

         // let promisesValues = await Promise.all(nodespromises);
         // for (const iterator of promisesValues) {
         //   const listeFiltered = this.filterList(iterator);
         //   this.config.items = [...this.config.items, ...listeFiltered];
         // }
      },

      getLeafDbIds(selections) {
         const dbIds = selections.map((el) => {
            return bimObjectManagerService.getLeafDbIds(el.model, el.selection);
         });
         return Promise.all(dbIds);
      },

      addItemToList({ model, selection }) {
         const elementFound = this.config.items.find(
            (el) => el.model.id === model.id
         );

         if (!elementFound) {
            this.config.items.push({ model, selection });
            return;
         }

         for (const dbId of selection) {
            const found = elementFound.selection.find((el) => el === dbId);
            if (!found) elementFound.selection.push(dbId);
         }
      },

      changeItemCount() {
         this.count = 0;
         for (const item of this.config.items) {
            this.count += item.selection.length;
         }
      },

      showReferential() {
         // const items = this.config.items.map(({ model, selection }) => {
         //    return { model, ids: selection };
         // });
         // window.spinal.ForgeViewer.viewer.impl.selector.setAggregateSelection(
         //    items
         // );

         this.config.items.forEach(({ model, selection }) => {
            window.spinal.ForgeViewer.viewer.impl.selector.setSelection(
               selection,
               model
            );
         });
      },

      verifyResult() {
         this.loadAttributeResult = true;
         GenerateNetworkTreeService.getElementProperties(
            this.config.items,
            this.config.attributeName
         ).then((result) => {
            this.validItems = result.validItems;
            this.invalidItems = result.invalidItems;
            this.displayResult = true;
            this.loadAttributeResult = false;
         });
      },

      selectValidItemsOnModel() {
         const items = GenerateNetworkTreeService.classifyDbIdsByModel(
            this.validItems
         );

         window.spinal.ForgeViewer.viewer.impl.selector.setAggregateSelection(
            items
         );
      },

      selectInvalidItemsOnModel() {
         const items = GenerateNetworkTreeService.classifyDbIdsByModel(
            this.invalidItems
         );

         window.spinal.ForgeViewer.viewer.impl.selector.setAggregateSelection(
            items
         );
      },
   },
   watch: {
      // config: {
      //    items() {
      //       this.changeItemCount();
      //    },
      // },
   },
};
</script>

<style scoped>
.countdiv {
   height: 60px;
   display: flex;
   align-items: center;
   font-size: 1.2em;
}
</style>

<style>
.sub-content .buttons .md-button .md-ripple {
   padding: 0px !important;
}
</style>