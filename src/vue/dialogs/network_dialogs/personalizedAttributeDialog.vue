<template>
   <md-dialog
      :md-active.sync="showDialog"
      @md-closed="closeDialog(false)"
      class="personalizedDialog"
   >

      <md-dialog-title class="personalizedDialogTitle">Personnalize attribute</md-dialog-title>
      <md-dialog-content class="personalizedDialogContent">
         <div class="radios">
            <div class="radio">
               <md-radio
                  class="md-primary"
                  v-model="useRegex"
                  :value="true"
               >Use regex</md-radio>
            </div>

            <div class="radio">
               <div class="radio">
                  <md-radio
                     class="md-primary"
                     v-model="useRegex"
                     :value="false"
                  >Use Function</md-radio>
               </div>
            </div>
         </div>

         <div v-if="useRegex">
            <div>
               <!-- <div class="md-layout-item md-size-50"><span class="md-caption">use <b>{{`'${PCL_ATTR}'`}}</b> to represente PLC attribute value</span></div>
               <div class="md-layout-item md-size-50"><span class="md-caption">use <b>{{`'${OBJECT_ATTR}'`}}</b> to represente PLC attribute value</span></div> -->
               <div>
                  <md-subheader class="md-primary">use {{` '${PCL_ATTR}' `}} to represente PLC attribute value</md-subheader>
               </div>

               <div>
                  <md-subheader class="md-primary">use {{` '${OBJECT_ATTR}' `}} to represente Object controlled attribute value</md-subheader>
               </div>
            </div>

            <md-list class="regex _content">
               <!-- <md-list-item class="radio">

            </md-list-item> -->

               <!-- <md-list-item>
               
            </md-list-item> -->

               <md-list-item>
                  <div class="md-layout-item md-size-35">
                     <md-field>
                        <label></label>
                        <md-select
                           id="vertical"
                           v-model="regexValue.select"
                        >
                           <md-option :value="PCL_ATTR">PCL Attribute Value</md-option>
                           <md-option :value="OBJECT_ATTR">Object controlled Attribute Value</md-option>
                        </md-select>
                     </md-field>
                  </div>

                  <div
                     class="md-layout-item md-size-20"
                     style="text-align : center"
                  >
                     must match with
                  </div>

                  <div class="md-layout-item md-size-35">
                     <md-field>
                        <md-icon :md-src="slashIcon"></md-icon>
                        <label>Your regex</label>
                        <md-input
                           :disabled="!useRegex"
                           v-model="regexValue.text"
                        ></md-input>
                        <md-icon :md-src="slashIcon"></md-icon>
                     </md-field>
                  </div>

               </md-list-item>

               <md-list-item>
                  <md-field class="_mdField">
                     <label>Flags</label>

                     <md-select
                        :disabled="!useRegex"
                        v-model="regexValue.flags"
                        name="flags"
                        id="flags"
                        md-dense
                        multiple
                     >

                        <md-option
                           v-for="(flag,index) in flagsList"
                           :key="index"
                           :value="flag.value"
                        >{{flag.name}}</md-option>

                     </md-select>

                  </md-field>
               </md-list-item>

            </md-list>
         </div>

         <div
            class="function _content"
            v-else
         >

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
import flagsList from "../../../js/flags";
import { PLC_ATTR, OBJECT_ATTR } from "../../../js/attributeConfig";
import SpinalCodeMirror from "../../components/code-mirror/SpinalCodeMirror.vue";

import functionText from "../../../js/personalized_functions/function";

const slashIcon = require("../../../assets/slash.svg");

export default {
   name: "personalizedAttributeDialog",
   props: ["onFinised"],
   components: { "spinal-code-mirror": SpinalCodeMirror },
   data() {
      this.callback;
      this.flagsList = flagsList;
      this.PCL_ATTR = PLC_ATTR;
      this.OBJECT_ATTR = OBJECT_ATTR;

      this.slashIcon = slashIcon;

      return {
         useRegex: true,
         showDialog: true,
         regexValue: {
            select: this.OBJECT_ATTR,
            text: "",
            flags: [],
         },
         functionValue: {
            code: functionText,
         },
      };
   },

   methods: {
      opened(option) {
         if (option.isPersonalized) {
            this.useRegex = option.attribute.isRegex;
            if (this.useRegex) {
               this.regexValue.text = option.attribute.text;
               this.regexValue.flags = option.attribute.flags;
               this.regexValue.select = option.attribute.select;
            } else {
               this.functionValue.code = option.attribute.callback;
            }
         }

         this.callback = option.callback;
      },

      removed(option) {
         if (option.closeResult) {
            if (typeof this.callback === "function") {
               if (this.useRegex) this.callback(this.useRegex, this.regexValue);
               else this.callback(this.useRegex, this.functionValue);
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

.personalizedDialog .personalizedDialogContent .radios {
   width: 100%;
   height: 50px;
   display: flex;
}

.personalizedDialog .personalizedDialogContent ._content {
   width: 100%;
   height: calc(100% - 50px);
}

/* 
.personalizedDialog .personalizedDialogContent .regex {
   width: 50%;
   height: 100%;
   border-right: 1px solid grey;

}

.personalizedDialog .personalizedDialogContent .function {
   width: 49%;
   height: 100%;

}

.personalizedDialog .personalizedDialogContent .function .radio {
   width: 100%;
   height: 50px;
}

.personalizedDialog .personalizedDialogContent .function .content {
   max-width: 100%;
   height: calc(100% - 50px);
   overflow: auto;
} */
</style>