<template>

  <md-table v-if="itemSelected"
            v-model="data"
            style="height : 100%">
    <!-- <md-table-toolbar>
      <h1 class="md-title">Users</h1>
    </md-table-toolbar> -->

    <md-table-empty-state md-label="No element found"
                          md-description="No bim object found in this context">
    </md-table-empty-state>

    <md-table-row slot="md-table-row"
                  slot-scope="{ item }">
      <md-table-cell md-label="dbId"
                     md-numeric>{{ item.dbid }}</md-table-cell>
      <md-table-cell md-label="Name">{{ item.name }}</md-table-cell>
      <md-table-cell md-label="Parent(s)">{{ formatParents(item)}}
      </md-table-cell>
      <md-table-cell md-label="Group(s)">{{ formatGroups(item) }}
      </md-table-cell>

    </md-table-row>
  </md-table>

</template>

<script>
const {
  spinalPanelManagerService
} = require("spinal-env-viewer-panel-manager-service");

import spinalNetworktree from "../../services";

export default {
  name: "networkTreeDetailPanel",
  data() {
    return {
      itemSelected: null,
      data: []
    };
  },
  methods: {
    opened(params) {
      this.itemSelected = params;
    },
    setTitle(title) {
      spinalPanelManagerService.panels.networkTreeDetailPanel.panel.setTitle(
        title
      );
    },
    getAllData(contextId) {
      return spinalNetworktree
        .getNetworkTreeBimObjects(contextId)
        .then(bimObjects => {
          let promises = bimObjects.map(async el => {
            let info = el.info.get();
            info["groups"] = await spinalNetworktree.getNetworkGroups(info.id);
            info[
              "parents"
            ] = await spinalNetworktree.getNetworkBimObjectParents(info.id);
            return info;
          });

          return Promise.all(promises);
        });
    },
    formatParents(item) {
      console.log("item parents", item);
      let parentsDbIds = item.parents.map(el => el.dbid);
      return parentsDbIds.length > 0 ? parentsDbIds.join(", ") : "-";
    },
    formatGroups(item) {
      console.log("item groups", item);
      let groupsNames = item.groups.map(el => el.name);
      return groupsNames.length > 0 ? groupsNames.join(", ") : "-";
    }
  },
  watch: {
    itemSelected() {
      this.getAllData(this.itemSelected.id).then(objects => {
        this.setTitle(`Network Tree : ${this.itemSelected.name}`);
        console.log("objects", objects);
        this.data = objects;
      });
    }
  }
};
</script>