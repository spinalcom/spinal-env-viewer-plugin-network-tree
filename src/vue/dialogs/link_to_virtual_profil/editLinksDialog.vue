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
      class="linkerDialogsContent"
   >
      <md-dialog-title style="text-align : center">Unlink Profil</md-dialog-title>
      <md-dialog-content>
         <edit-link :data="data"></edit-link>
      </md-dialog-content>
      <md-dialog-actions>
         <md-button
            class="md-primary"
            @click="closeDialog(false)"
         >close</md-button>

         <md-button
            class="md-primary"
            @click="closeDialog(true)"
         >Save</md-button>
      </md-dialog-actions>
   </md-dialog>
</template>


<script>
import editLinkContent from "../../components/links/editLinks.vue";

export default {
   name: "editLinksDialog",
   props: ["onFinised"],
   components: {
      "edit-link": editLinkContent,
   },
   data() {
      this.callback;

      return {
         showDialog: true,
         data: undefined,
      };
   },
   methods: {
      opened(option) {
         this.data = JSON.parse(JSON.stringify(option.data));
         this.callback = option.callback;
      },
      removed(option) {
         if (option) {
            if (typeof this.callback === "function") this.callback(this.data);
         }
         this.showDialog = false;
      },
      closeDialog(closeResult) {
         if (typeof this.onFinised === "function") {
            this.onFinised(closeResult);
         }
      },

      // _formatInvalidData(data) {
      //   console.log("data", data);
      //   data.invalidAutomateItems = data.invalidAutomateItems.map((el) => {
      //     el.checked = false;
      //     return el;
      //   });
      //   data.invalidProfileItems = data.invalidProfileItems.map((el) => {
      //     el.checked = false;
      //     return el;
      //   });

      //   return data;
      // },
   },
};
</script>

<style scoped>
.linkerDialogsContent {
   width: 100%;
   height: 100%;
}
</style>