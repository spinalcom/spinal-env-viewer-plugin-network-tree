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
  <md-dialog class="mdDialogContainer"
             :md-active.sync="showDialog"
             @md-closed="closeDialog(false)">
    <md-dialog-title class="dialogTitle">Link Automate to Profil
    </md-dialog-title>
    <md-dialog-content class="content">

      <!-- <links-device-to-device ref="device-to-device"
                              :virtualDeviceContextId="virtual.contextId"
                              :virtualDeviceId="virtual.deviceId"
                              :physicalDeviceContextId="physical.contextId"
                              :physicalDeviceId="physical.profilId">
      </links-device-to-device> -->

    </md-dialog-content>
    <md-dialog-actions>
      <md-button class="md-primary"
                 @click="closeDialog(false)">Previous</md-button>
      <md-button class="md-primary"
                 @click="closeDialog(true)">Save</md-button>
    </md-dialog-actions>
  </md-dialog>

</template>

<script>
import linksDeviceToDevicesTemplateVue from "../components/links/linksDeviceToDevicesTemplate.vue";

export default {
  name: "linkDevices",
  props: ["onFinised"],
  data() {
    return {
      showDialog: true,
      virtual: {},
      physical: {},
    };
  },
  components: {
    "links-device-to-device": linksDeviceToDevicesTemplateVue,
  },
  methods: {
    opened(option) {
      // this.virtual = option.virtual;
      // this.physical = option.physical;
    },

    removed(option) {
      if (option) {
        // const reference = this.$refs["device-to-device"];
        // if (reference) {
        //   const physicalMap = reference.physicalMap;
        //   const virtualMap = reference.virtualMap;
        //   for (const key of Array.from(physicalMap.keys())) {
        //     console.log(
        //       `${physicalMap.get(key).name} --------------------> ${
        //         virtualMap.get(key) && virtualMap.get(key).name
        //       }`
        //     );
        //   }
        // }
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

<style scoped>
.mdDialogContainer {
  width: 60%;
  height: 600px;
}

.mdDialogContainer .dialogTitle {
  text-align: center;
}
</style>