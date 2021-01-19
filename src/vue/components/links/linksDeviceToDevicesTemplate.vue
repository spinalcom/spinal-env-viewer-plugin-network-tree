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
  <div class="devices_container">
    <div class="devices_div">
      <div class="name"></div>
    </div>
    <div class="devices_div">
      <div class="name"></div>
    </div>
  </div>
</template>

<script>
import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import { NETWORK_BIMOJECT_RELATION } from "../../services/constants";
import utilities from "../../../js/utilities";

const _ = require("lodash");

export default {
  name: "linksDeviceToDevicesTemplate",
  props: {
    virtualDeviceContextId: {},
    virtualDeviceId: {},
    physicalDeviceContextId: {},
    physicalDeviceId: {},
  },
  data() {
    return {
      physicalMap: new Map(),
      virtualMap: new Map(),
    };
  },
  mounted() {
    // this.createMapsFunc = _.once(this.createMaps());
  },
  methods: {
    createMaps() {
      const virtualElementsPromise = utilities.getItemsList(
        this.virtualDeviceId
      );
      const physicalElementsPromise = SpinalGraphService.getChildren(
        this.physicalDeviceId,
        [NETWORK_BIMOJECT_RELATION]
      );

      return Promise.all([
        virtualElementsPromise,
        physicalElementsPromise,
      ]).then((result) => {
        const virtualElements = result[0];
        const physicalElements = result[1].map((el) => el.get());

        this.physicalMap = this._formatMap(physicalElements, "suffix");
        this.virtualMap = this._formatMap(virtualElements, "namingConvention");
      });
    },

    _formatMap(liste, property) {
      const map = new Map();
      for (const iterator of liste) {
        map.set(iterator[property], iterator);
      }

      return map;
    },
  },
  watch: {
    virtualDeviceId() {
      this.createMaps();
      // this.createMapsFunc();
    },
    physicalDeviceId() {
      // this.createMapsFunc();
    },
  },
};
</script>

<style scoped>
.devices_container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
}

.devices_container .devices_div {
  width: 49%;
  height: 100%;
  border: 1px solid red;
}
</style>