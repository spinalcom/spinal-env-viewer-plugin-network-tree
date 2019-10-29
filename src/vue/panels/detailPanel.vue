<template>
  <md-content class="myContainer md-scrollbar">

    <div class="header">
      <md-button class="md-primary exportBtn"
                 @click="exportFile">Export</md-button>
    </div>

    <md-table v-if="itemSelected"
              v-model="data"
              class="myTable md-scrollbar">
      <!-- <md-table-toolbar>
      <h1 class="md-title">Users</h1>
    </md-table-toolbar> -->

      <md-table-empty-state md-label="No element found"
                            md-description="No bim object found in this context">
      </md-table-empty-state>

      <md-table-row slot="md-table-row"
                    slot-scope="{ item }">

        <md-table-cell md-label="Id"
                       md-numeric
                       :title="item.externalId"
                       class="tableColumn">{{ item.externalId }}
        </md-table-cell>

        <md-table-cell md-label="Name"
                       :title="item.name"
                       class="tableColumn">{{ item.name }}</md-table-cell>

        <md-table-cell md-label="Parent(s)"
                       :title="formatParents(item)"
                       class="tableColumn">{{ formatParents(item)}}
        </md-table-cell>

        <md-table-cell md-label="Group(s)"
                       :title="formatGroups(item)"
                       class="tableColumn">{{ formatGroups(item) }}
        </md-table-cell>

      </md-table-row>
    </md-table>
  </md-content>
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
      let parentsDbIds = item.parents.map(el => el.externalId);
      return parentsDbIds.length > 0 ? parentsDbIds.join(", ") : "-";
    },
    formatGroups(item) {
      let groupsNames = item.groups.map(el => el.name);
      return groupsNames.length > 0 ? groupsNames.join(", ") : "-";
    },

    exportFile() {
      console.log("export");
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

<style scoped>
.myContainer {
  width: calc(100%);
  height: calc(100%);
  overflow: auto;
}

.myContainer .header {
  width: calc(100%);
  height: calc(10% - 10px);
  margin-bottom: 10px;
  display: flex;
  justify-content: flex-end;
}

.myContainer .mytable {
  width: calc(80%);
  height: calc(90%);
  margin: 10px;
}

.exportBtn {
  border: 1px solid #448aff;
  width: 150px;
}

/* .tableColumn {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
} */
</style>