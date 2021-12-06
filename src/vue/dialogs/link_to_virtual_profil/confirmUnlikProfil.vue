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
  <md-dialog class="mdDialogContainer"
             :md-active.sync="showDialog"
             @md-closed="closeDialog(false)">
    <md-dialog-title style="text-align : center">Unlink Profil</md-dialog-title>
    <md-dialog-content>
      <div class="content">
        <div class="normal"
             v-if="state == STATES.normal">
          <div>
            <!-- style="text-align : center" -->
            Do you want to delete the profil link ?
          </div>
          <div>
            <md-checkbox v-model="unLinkAlsoBmsDevice"
                         class="md-primary">Remove Also bmsDevices</md-checkbox>
          </div>
        </div>
        <div class="state"
             v-else>
          <md-progress-spinner md-mode="indeterminate"
                               v-if="state == STATES.loading">
          </md-progress-spinner>
          <md-icon class="md-size-5x"
                   v-else-if="state == STATES.success">done</md-icon>
          <md-icon class="md-size-5x"
                   v-else-if="state == STATES.error">error</md-icon>
        </div>
      </div>

    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary"
                 @click="closeDialog(false)">No</md-button>
      <md-button class="md-primary"
                 :disabled="state != STATES.normal"
                 @click="removeLink">Yes</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>

<script>
import unlinkController from "../../../js/controllers/links/unLinkProfilController";

export default {
  name: "confirmUnlikProfilDialog",
  props: ["onFinised"],
  data() {
    this.contextId;
    this.nodeId;

    this.STATES = {
      loading: 1,
      normal: 2,
      error: 3,
      success: 4,
    };
    return {
      state: this.STATES.normal,
      showDialog: true,
      unLinkAlsoBmsDevice: true,
    };
  },
  methods: {
    opened(option) {
      this.contextId = option.contextId;
      this.nodeId = option.nodeId;
    },

    async removeLink() {
      try {
        this.state = this.STATES.loading;
        await unlinkController.unLink(
          this.contextId,
          this.nodeId,
          this.unLinkAlsoBmsDevice
        );
        this.state = this.STATES.success;
      } catch (error) {
        console.error(error);
        this.state = this.STATES.error;
      }
    },

    removed(option) {
      // if (typeof this.callback === "function") {
      //   this.callback(option);
      // }
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

<style scoped>
.mdDialogContainer {
  width: 500px;
  height: 500px;
}

.mdDialogContainer .md-dialog-container {
  max-width: 100%;
  max-height: 100%;
}

.content {
  width: 100%;
  height: 100%;
  font-size: 1.5em;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>