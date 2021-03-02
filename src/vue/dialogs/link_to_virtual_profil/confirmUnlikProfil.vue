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
      <md-dialog-title style="text-align : center">Unlink Profil</md-dialog-title>
      <md-dialog-content>
         <p style="text-align : center">
            do you want to delete the link?
         </p>
      </md-dialog-content>
      <md-dialog-actions>
         <md-button
            class="md-primary"
            @click="closeDialog(false)"
         >No</md-button>
         <md-button
            class="md-primary"
            @click="closeDialog(true)"
         >Yes</md-button>
      </md-dialog-actions>
   </md-dialog>
</template>

<script>
export default {
   name: "confirmUnlikProfilDialog",
   props: ["onFinised"],
   data() {
      this.callback;
      return {
         showDialog: true,
      };
   },
   methods: {
      opened(option) {
         this.callback = option.callback;
      },
      removed(option) {
         if (typeof this.callback === "function") {
            this.callback(option);
         }
         this.showDialog = false;
      },
      closeDialog(closeResult) {
         if (typeof this.onFinised === "function") {
            this.onFinised(closeResult);
         }
      },
   },
};
</script>