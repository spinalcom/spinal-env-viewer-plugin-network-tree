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

   <md-dialog
      :md-active.sync="showDialog"
      @md-closed="closeDialog(false)"
   >
      <md-dialog-title>{{title}}</md-dialog-title>
      <md-dialog-content>
         <md-field>
            <label>{{label}}</label>
            <md-input v-model="inputValue"></md-input>
         </md-field>

      </md-dialog-content>
      <md-dialog-actions>
         <md-button
            class="md-primary"
            @click="closeDialog(false)"
         >Close</md-button>
         <md-button
            class="md-primary"
            @click="closeDialog(true)"
            :disabled="!(inputValue.trim().length > 0)"
         >Save</md-button>
      </md-dialog-actions>
   </md-dialog>
</template>

<script>
// import networkTreeService from "../../../services";

import { NetworkTreeService } from "spinal-env-viewer-plugin-network-tree-service";

export default {
   name: "createNetworkDialog",
   props: ["onFinised"],
   data() {
      return {
         showDialog: true,
         inputValue: "",
         title: "",
         label: "",
         createContext: "",
         selectedNode: null,
         context: null,
      };
   },
   methods: {
      opened(option) {
         this.title = option.title;
         this.label = option.label;
         this.selectedNode = option.selectedNode;
         this.context = option.context;
         this.createContext = option.createContext;
      },

      removed(option) {
         if (option.closeResult && option.inputValue.trim().length > 0) {
            let name = this.inputValue.trim();
            if (this.createContext) {
               // networkTreeService.createNetworkContext(name);
               NetworkTreeService.createNetworkContext(name);
            } else {
               // networkTreeService.addNetwork(
               //    name,
               //    this.selectedNode.id.get(),
               //    this.context.id.get()
               // );
               NetworkTreeService.addNetwork(
                  name,
                  this.selectedNode.id.get(),
                  this.context.id.get()
               );
            }
         }
         this.showDialog = false;
      },

      closeDialog(closeResult) {
         if (typeof this.onFinised === "function") {
            this.onFinised({ closeResult, inputValue: this.inputValue });
         }
      },
   },
};
</script>