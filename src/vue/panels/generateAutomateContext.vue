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
   <div class="generation_container">
      <md-steppers
         md-vertical
         class="steppers"
         :md-dynamic-height="true"
         @md-changed="changeStep"
      >

         <md-step
            id="first"
            md-label="PLC selection"
            md-description="Select all PLC"
         >
            <div class="step-container md-scrollbar">
               <selection-step
                  :config="data.objAutomate"
                  @clear="clearAutomates"
                  @changed="() => this.changed = true"
               ></selection-step>
            </div>

         </md-step>

         <md-step
            id="second"
            md-label="Selection of controlled objects"
            md-description="Select all controlled objects"
         >
            <md-content class="step-container md-scrollbar">
               <selection-step
                  :config="data.objEquipment"
                  @clear="clearEquipments"
                  @changed="() => this.changed = true"
               ></selection-step>
            </md-content>
         </md-step>

         <md-step
            id="third"
            md-label="Configuration PLC and objects association"
            md-description="Wich objects are controlled by which PLC"
            :md-error="errorInConfig"
         >
            <md-content class="step-container md-scrollbar">
               <configuration-step
                  :automateObj="data.objAutomate"
                  :equipmentObj="data.objEquipment"
                  :attribute="data.attribute"
                  @changed="() => this.changed = true"
               ></configuration-step>
            </md-content>

         </md-step>

         <md-step
            id="fourth"
            md-label="Configure naming Convention"
            md-description="create the network tree structure"
         >
            <naming-convention-step :config="data.namingConvention"></naming-convention-step>
         </md-step>

         <md-step
            id="fifth"
            md-label="Creation Step"
            md-description="create the network tree structure"
         >

            <div class="step-container md-scrollbar">
               <launch-generation-step
                  :automatesObj="data.objAutomate"
                  :equipmentsObj="data.objEquipment"
                  :attribute="data.attribute"
                  :namingConvention="data.namingConvention"
                  :contextId="contextId"
                  :selectedNodeId="selectedNodeId"
                  :changed="changed"
                  @verified="() => this.changed = false"
               >
               </launch-generation-step>
            </div>

         </md-step>

      </md-steppers>
   </div>
</template>

<script>
import ConfigurationStep from "../components/steps/configurationStep.vue";
import launchGenerationStep from "../components/steps/launchStep.vue";
import selectionStep from "../components/steps/selectionStep.vue";
import namingConventionStep from "../components/steps/namingConventionStep.vue";

import { OBJECT_ATTR } from "../../js/attributeConfig";

export default {
   name: "heatmapPanel",
   components: {
      "configuration-step": ConfigurationStep,
      "launch-generation-step": launchGenerationStep,
      "selection-step": selectionStep,
      "naming-convention-step": namingConventionStep,
   },
   data() {
      return {
         changed: false,
         active: "first",
         first: false,
         second: false,
         third: false,
         firstStepError: false,
         errorInConfig: null,
         contextId: "",
         selectedNodeId: "",
         data: {
            objAutomate: {
               attributeName: "CFA_Repère d'équipement",
               // attributeName: "CFA_Code équipement",
               items: [],
            },
            objEquipment: {
               attributeName: "CFA_Repère d'équipement",
               // attributeName: "CFA_Code équipement",
               items: [],
            },
            attribute: {
               isRegex: true,
               text: "",
               flags: [],
               select: OBJECT_ATTR,
               callback: () => {},
            },
            namingConvention: {
               attributeName: "CFA_Repère d'équipement",
               useAttrValue: true,
               personalized: {
                  callback: () => {},
               },
            },
            // attribute: {
            //    id: Date.now(),
            //    attributeName: "Attribut GTB",
            //    separator: "_",
            //    indice: 3,
            // },
         },
         errors: {
            firstStep: { error: false, message: "" },
            secondStep: { error: false, message: "" },
            thirdStep: { error: false, message: "" },
         },
      };
   },
   methods: {
      async opened(option) {
         this.contextId = option.context.id;
         this.selectedNodeId = option.selectedNode.id;
      },

      closed() {},

      clearAutomates() {
         this.data.objAutomate.items = [];
         this.changed = true;
      },

      clearEquipments() {
         this.data.objEquipment.items = [];
         this.changed = true;
      },

      errorInFirstStep() {
         this.errorInConfig = "This is an error!";
      },

      changeStep(step) {},
   },
   computed: {
      // attribute_attributeName() {
      //    return this.data.attribute.attributeName;
      // },
      // attribute_separator() {
      //    return this.data.attribute.separator;
      // },
      // attribute_indice() {
      //    return this.data.attribute.indice;
      // },
   },
   watch: {
      attribute_attributeName() {
         this.changed = true;
      },

      attribute_separator() {
         this.changed = true;
      },

      attribute_indice() {
         this.changed = true;
      },
   },
};
</script>

<style scoped>
.generation_container {
   width: 100%;
   height: 100%;
   padding: unset;
}

.generation_container .selection_content {
   width: 100%;
   min-height: 150px;
   display: flex;
   flex-direction: column;
}

.generation_container .selection_content .text {
   width: 100%;
   height: 50px;
   display: flex;
   align-items: center;
   justify-content: center;
}

.generation_container .attribute {
   padding: 0px 10px 0px 10px;
}

.generation_container .selection_content .buttons {
   display: flex;
   justify-content: center;
   align-items: center;
}

.generation_container .launch_content {
   display: flex;
   justify-content: center;
   align-items: center;
}
</style>

<style>
/*
.generation_container .attribute {
}

.generation_container .launch_content .md-button {
}*/
</style>

<style>
.generation_container .steppers .md-field {
   min-height: unset;
}
</style>