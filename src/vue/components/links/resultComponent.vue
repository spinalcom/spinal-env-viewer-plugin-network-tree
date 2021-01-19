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
  <div class="result_container">
    <div class="title"
         v-tooltip="results.automate.name">{{results.automate.name}}</div>
    <div class="content">
      <div class="valids textDiv">items linked : {{results.valids.length}}</div>
      <div class="invalids textDiv">items not linked :
        {{results.invalidAutomateItems.length}}</div>
      <div class="button">
        <md-button class="md-raised md-primary"
                   @click="editLink">Edit</md-button>
      </div>
    </div>
  </div>
</template>

<script>
import { spinalPanelManagerService } from "spinal-env-viewer-panel-manager-service";
// import Vue from "vue";
// Vue.forceUpdate();

export default {
  name: "resultComponent",
  props: {
    // automate: {},
    results: {},
  },
  data() {
    return {
      // renderComponent: true,
    };
  },
  methods: {
    editLink() {
      spinalPanelManagerService.openPanel("editAutomateLinkDialog", {
        data: this.results,
        callback: (dataEdited) => {
          // this.results = dataEdited;
          this.$emit("edit", {
            automateId: this.results.automate.id,
            value: dataEdited,
          });
        },
      });
    },

    forceRerender() {
      this.$forceUpdate();
    },
  },
};
</script>

<style scoped>
.result_container {
  width: 100%;
  height: 100%;
  /* padding: 5px; */
  /* width: 45%;
  height: 100px;
  border: 1px solid gray; */
}

.result_container .title {
  width: 100%;
  height: 20%;
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  text-align: center;
  padding: 5px;
  background: grey;
}

.result_container .content {
  width: 100%;
  height: 80%;
  padding: 5px;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

.result_container .content .textDiv {
  font-size: 1.5em;
}
</style>
