<!--
Copyright 2022 SpinalCom - www.spinalcom.com

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
  <div class="config_content">
    <div class="useThese">
      <md-checkbox class="md-primary"
                   v-model="properties.useTheseAttributes">
        Use also these configurations to link subItems</md-checkbox>
    </div>

    <div class="_container">
      <div class="subcontent">
        <div class="title">BMS Attribute</div>
        <div class="content">
          <div class="div_select">
            <!-- <md-field>
              <label for="property">BMS property</label>
              <md-select v-model="bmsData.property"
                         name="Bms Property"
                         id="property"
                         placeholder="Bms Property">
                <md-option v-for="property in bmsProperties"
                           :value="property.value"
                           :key="property.value">{{property.name}}</md-option>
              </md-select>
            </md-field> -->
            <md-field>
              <label>BMS Property</label>
              <md-input v-model="bmsData.property"></md-input>
            </md-field>
          </div>

          <div class="div_code">
            <div class="checkbox_div">
              <md-checkbox class="md-primary"
                           v-model="bmsData.useFunction">Use function to format
                value</md-checkbox>
            </div>

            <div class="text_editor"
                 v-if="bmsData.useFunction">
              <spinal-code-mirror class="editorContainer"
                                  :codeObj="bmsData.callback">
              </spinal-code-mirror>
            </div>
          </div>

        </div>
      </div>
      <div class="subcontent">
        <div class="title">BIM Attribute</div>
        <div class="content">
          <div class="div_select">
            <md-field>
              <label>BIM Property</label>
              <md-input v-model="bimData.property"></md-input>
            </md-field>
          </div>

          <div class="div_code">
            <div class="checkbox_div">
              <md-checkbox class="md-primary"
                           v-model="bimData.useFunction">Use function to format
                value</md-checkbox>
            </div>

            <div class="text_editor"
                 v-if="bimData.useFunction">
              <spinal-code-mirror class="editorContainer"
                                  :codeObj="bimData.callback">
              </spinal-code-mirror>
            </div>

          </div>

        </div>
      </div>
    </div>
  </div>

</template>

<script>
import { SpinalBmsDevice } from "spinal-model-bmsnetwork";
import SpinalCodeMirror from "../../components/code-mirror/SpinalCodeMirror.vue";

export default {
  name: "configurationTemplate",
  props: {
    bimData: {},
    bmsData: {},
    properties: {},
  },
  components: { "spinal-code-mirror": SpinalCodeMirror },
  data() {
    return {
      bmsProperties: [],
    };
  },
  mounted() {
    this.bmsProperties = this.getBmsProperties();
  },
  methods: {
    getBmsProperties() {
      // const device = new SpinalBmsDevice();
      // return device._attribute_names.map((element) => ({
      //    name: element,
      //    value: element,
      // }));
      return [
        {
          name: "Device ID",
          value: "id",
        },
        {
          name: "Device Name",
          value: "name",
        },
        {
          name: "IP address",
          value: "address",
        },
        {
          name: "Mac address",
          value: "hostId",
        },
      ];
    },
  },
};
</script>


<style scoped>
.config_content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.config_content .useThese {
  width: 100%;
  height: 9%;
  display: flex;
  align-items: center;
  font-size: 1.3em;
}

.config_content ._container {
  width: 100%;
  height: 90%;
  display: flex;
  justify-content: space-between;
}

.config_content ._container .subcontent {
  width: 49%;
  height: 100%;
  border: 1px solid #ffffff;
  border-radius: 5%;
}

.config_content ._container .subcontent .title {
  width: 100%;
  height: 50px;
  border-bottom: 1px solid white;
  display: flex;
  justify-content: center;
  align-items: center;
}

.config_content ._container .subcontent .content {
  height: calc(100% - 50px);
  padding: 0 7px;
}

.config_content ._container .subcontent .content .div_select {
  width: 100%;
  height: 50px;
}

.config_content ._container .subcontent .content .div_code {
  width: 100%;
  height: calc(100% - 60px);
}

.config_content ._container .subcontent .content .div_code .checkbox_div {
  width: 100%;
  height: 50px;
}

.config_content ._container .subcontent .content .div_code .text_editor {
  width: 100%;
  height: calc(100% - 50px);
}
</style>

<style>
.config_content
  ._container
  .subcontent
  .content
  .div_code
  .text_editor
  .CodeMirror.cm-s-monokai.CodeMirror-wrap {
  width: 100%;
  height: 98%;
}
</style>