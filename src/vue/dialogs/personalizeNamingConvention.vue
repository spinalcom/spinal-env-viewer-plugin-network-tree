<template>
   <md-dialog
      :md-active.sync="showDialog"
      @md-closed="closeDialog(false)"
      class="personalizedDialog"
   >
      <md-dialog-title class="personalizedDialogTitle">Personnalize Naming convention</md-dialog-title>

      <md-dialog-content class="personalizedDialogContent">
         <div class="function _content">

            <spinal-code-mirror
               class="editorContainer"
               :codeObj="functionValue"
            ></spinal-code-mirror>

         </div>

      </md-dialog-content>

      <md-dialog-actions>
         <md-button
            class="md-primary"
            @click="closeDialog(false)"
         >Close</md-button>
         <md-button
            class="md-primary"
            @click="closeDialog(true)"
         >Save</md-button>
      </md-dialog-actions>
   </md-dialog>
</template>


<script>
import SpinalCodeMirror from "../components/code-mirror/SpinalCodeMirror.vue";

import functionText from "../../js/naming_convention_function";

export default {
   name: "PersonalizeNamingConvention",
   props: ["onFinised"],
   components: { "spinal-code-mirror": SpinalCodeMirror },
   data() {
      this.callback;

      return {
         showDialog: true,
         functionValue: {
            code: functionText,
         },
      };
   },
   methods: {
      opened(option) {
         if (!option.config.useAttrValue) {
            this.functionValue.code = option.config.personalized.callback;
         }

         this.callback = option.callback;
      },

      removed(option) {
         if (option.closeResult) {
            if (typeof this.callback === "function") {
               this.callback(this.functionValue.code);
            }
         }
         this.showDialog = false;
      },

      closeDialog(closeResult) {
         if (typeof this.onFinised === "function") {
            this.onFinised({ closeResult });
         }
      },
   },
};
</script>

<style scoped>
.personalizedDialog {
   width: 1000px;
   height: 500px;
}

.personalizedDialog .personalizedDialogTitle {
   text-align: center;
}

.personalizedDialog .personalizedDialogContent {
   width: 100%;
   height: 100%;
   /* display: flex;
   justify-content: space-between; */
}

.personalizedDialog .personalizedDialogContent ._content {
   width: 100%;
   height: calc(100% - 50px);
}
</style>