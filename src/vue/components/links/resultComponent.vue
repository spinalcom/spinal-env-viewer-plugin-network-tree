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

      <div class="valids textDiv"
           v-tooltip="`${results.valids.length} Items linked`">
        <div class="value">{{results.valids.length}}</div>
        <div class="name">Items linked</div>
      </div>

      <div class="invalids textDiv"
           v-tooltip="`${results.invalidAutomateItems.length} Items not linked`">
        <div class="value">{{results.invalidAutomateItems.length}}</div>
        <div class="name">Items not linked</div>
      </div>

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
        nodeId: this.results.automate.id,
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result_container .title {
  width: 40%;
  font-size: 1em;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  /* text-align: center; */
  padding: 5px;
}

.result_container .content {
  width: 45%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.result_container .content .textDiv {
  max-width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.2em;
  margin-right: 5px;
}

.result_container .content .textDiv .name {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.result_container .content .textDiv.invalids {
  color: #ff5252;
}

.result_container .content .textDiv.valids {
  color: #448aff;
}

/* .result_container .title {
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
} */
</style>
