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
  <md-dialog :md-active.sync="showDialog"
             @md-closed="closeDialog(false)"
             class="linkerDialogsContent">
    <md-dialog-title style="text-align : center">Unlink Profil</md-dialog-title>

    <md-dialog-content>
      <edit-link v-if="!success"
                 :data="data"
                 :rightTitle="'Profil Items'"
                 :leftTitle="'Automate Items'"></edit-link>

      <div class="centered"
           v-else>
        <md-icon class="md-size-5x">done</md-icon>
      </div>
    </md-dialog-content>

    <md-dialog-actions>
      <md-button class="md-primary"
                 @click="closeDialog(false)">close</md-button>

      <md-button class="md-primary"
                 :disabled="success"
                 @click="editLink">Save</md-button>
    </md-dialog-actions>
  </md-dialog>
</template>


<script>
import {
  LinkNetworkTreeService,
  CONSTANTS,
} from "spinal-env-viewer-plugin-network-tree-service";

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
      success: false,
      showDialog: true,
      data: undefined,
    };
  },
  methods: {
    async opened(option) {
      // this.data = JSON.parse(JSON.stringify(option.data));
      this.data = await LinkNetworkTreeService.getDeviceAndProfilData(
        option.nodeId
      );
      // this.callback = option.callback;
    },

    async editLink() {
      const validPromises = this.data.valids.map(
        ({ automateItem, profileItem }) =>
          LinkNetworkTreeService.linkAutomateItemToProfilItem(
            automateItem.id,
            profileItem.id
          )
      );

      await Promise.all(validPromises);

      const invaliPromises = this.data.invalidAutomateItems.map((el) =>
        LinkNetworkTreeService.unLinkAutomateItemToProfilItem(el.id)
      );
      await Promise.all(invaliPromises);

      this.success = true;
    },

    async removed(option) {
      if (option) {
        // // if (typeof this.callback === "function") this.callback(this.data);
        // const validPromises = this.data.valids.map(
        //    ({ automateItem, profileItem }) =>
        //       LinkNetworkTreeService.linkAutomateItemToProfilItem(
        //          automateItem.id,
        //          profileItem.id
        //       )
        // );
        // await Promise.all(validPromises).then(() => {
        //    const invaliPromises = res.invalidAutomateItems.map((el) =>
        //       LinkNetworkTreeService.unLinkAutomateItemToProfilItem(el.id)
        //    );
        //    return Promise.all(invaliPromises);
        // });
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

.centered {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

<style>
.linkerDialogsContent .md-dialog-container {
  max-width: 100%;
  max-height: 100%;
}
</style>