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
    <md-steppers md-vertical
                 class="steppers"
                 :md-dynamic-height="true"
                 @md-changed="changeStep">

      <md-step id="first"
               md-label="Automates"
               md-description="select automates">
        <md-content class="step-container md-scrollbar">
          <selection-step :items="data.automates"
                          @clear="clearAutomates" 
                          @changed="() => this.changed = true"></selection-step>
        </md-content>

      </md-step>

      <md-step id="second"
               md-label="Items"
               md-description="select objects to classify">
        <md-content class="step-container md-scrollbar">
          <selection-step :items="data.equipments"
                          @clear="clearEquipments" 
                          @changed="() => this.changed = true"></selection-step>
        </md-content>
      </md-step>

      <md-step id="third"
               md-label="Configuration Step"
               md-description="configure"
               :md-error="errorInConfig">
        <md-content class="step-container md-scrollbar">
          <configuration-step :data="data"
                              :attribute="data.attribute" @changed="() => this.changed = true"></configuration-step>
        </md-content>

      </md-step>

      <md-step id="fourth"
               md-label="Creation Step"
               md-description="create">

        <md-content class="step-container md-scrollbar">
          <launch-generation-step :automates="data.automates"
                                  :equipments="data.equipments"
                                  :attribute="data.attribute"
                                  :contextId="contextId"
                                  :selectedNodeId="selectedNodeId" 
                                  :changed="changed" 
                                  @verified="() => this.changed = false">
          </launch-generation-step>
        </md-content>

      </md-step>

    </md-steppers>
  </div>
</template>

<script>
import ConfigurationStep from "../components/steps/configurationStep.vue";
import launchGenerationStep from "../components/steps/launchStep.vue";
import selectionStep from "../components/steps/selectionStep.vue";

export default {
  name: "heatmapPanel",
  components: {
    "configuration-step": ConfigurationStep,
    "launch-generation-step": launchGenerationStep,
    "selection-step": selectionStep,
  },
  data() {
    return {
      changed : false,
      active: "first",
      first: false,
      second: false,
      third: false,
      firstStepError: false,
      errorInConfig: null,
      contextId: "",
      selectedNodeId: "",
      data: {
        automates: [],
        equipments: [],
        attribute: {
          id: Date.now(),
          attributeName: "Attribut GTB",
          separator: "_",
          indice: 3,
        },
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
      this.data.automates = [];
      this.changed = true;
    },

    clearEquipments() {
      this.data.equipments = [];
      this.changed = true;
    },

    errorInFirstStep() {
      this.errorInConfig = "This is an error!";
    },

    changeStep(step) {},
  },
  computed : {
    attribute_attributeName() {
      return this.data.attribute.attributeName;
    },

    attribute_separator() {
      return this.data.attribute.separator;
    },

    attribute_indice() {
      return this.data.attribute.indice;
    },
  },
  watch: {
    attribute_attributeName() {
      this.changed = true
    },

    attribute_separator() {
      this.changed = true
    },
    
    attribute_indice() {
      this.changed = true
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
.generation_container .attribute {
}

.generation_container .launch_content .md-button {
}
</style>