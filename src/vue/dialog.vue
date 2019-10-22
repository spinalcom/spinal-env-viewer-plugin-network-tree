<template>
  <div>
    <md-dialog :md-active.sync="showDialog"
               @md-closed="closeDialog(false)">
      <md-dialog-title>{{title}}</md-dialog-title>
      <md-dialog-content>
        <md-field>
          <label>{{label}}</label>
          <md-input v-model="inputValue"></md-input>
        </md-field>

      </md-dialog-content>
      <md-dialog-actions>
        <md-button class="md-primary"
                   @click="closeDialog(false)">Close</md-button>
        <md-button class="md-primary"
                   @click="closeDialog(true)"
                   :disabled="!(inputValue.trim().length > 0)">Save</md-button>
      </md-dialog-actions>
    </md-dialog>
  </div>
</template>

<script>
import networkTreeService from "../services";

export default {
  name: "createNetworkDialog",
  props: ["onFinised"],
  data() {
    return {
      showDialog: true,
      inputValue: "",
      title: "",
      label: "",
      createContext: "",
      selectedNode: null,
      context: null
    };
  },
  methods: {
    opened(option) {
      this.title = option.title;
      this.label = option.label;
      this.selectedNode = option.selectedNode;
      this.context = option.context;
      this.createContext = option.createContext;
    },
    removed(option) {
      if (option.closeResult && option.inputValue.trim().length > 0) {
        let name = this.inputValue.trim();
        if (this.createContext) {
          networkTreeService.createNetworkContext(name);
        } else {
          networkTreeService.addNetwork(
            name,
            this.selectedNode.id.get(),
            this.context.id.get()
          );
        }
      }
      this.showDialog = false;
    },
    closeDialog(closeResult) {
      if (typeof this.onFinised === "function") {
        this.onFinised({ closeResult, inputValue: this.inputValue });
      }
    }
  }
};
</script>