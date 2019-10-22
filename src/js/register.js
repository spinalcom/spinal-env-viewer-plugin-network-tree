import Vue from "vue";
import dialogComponent from "../vue/dialog.vue";

const {
  SpinalMountExtention
} = require("spinal-env-viewer-panel-manager-service");


const dialogs = [{
  name: "createNetworkDialog",
  vueMountComponent: Vue.extend(dialogComponent),
  parentContainer: document.body
}]

for (let index = 0; index < dialogs.length; index++) {
  SpinalMountExtention.mount(dialogs[index]);
}