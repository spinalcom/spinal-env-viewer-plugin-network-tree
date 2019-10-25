import Vue from "vue";
import dialogComponent from "../vue/dialogs/dialog.vue";
import detailPanel from "../vue/panels/detailPanel.vue";

const {
  SpinalMountExtention
} = require("spinal-env-viewer-panel-manager-service");


const {
  SpinalForgeExtention
} = require("spinal-env-viewer-panel-manager-service_spinalforgeextention");



//////////////////////////////////////////////////////////////////////////////////
// register Dialogs
/////////////////////////////////////////////////////////////////////////////////


const dialogs = [{
  name: "createNetworkDialog",
  vueMountComponent: Vue.extend(dialogComponent),
  parentContainer: document.body
}]

for (let index = 0; index < dialogs.length; index++) {
  SpinalMountExtention.mount(dialogs[index]);
}



//////////////////////////////////////////////////////////////////////////////////
// register Panels
/////////////////////////////////////////////////////////////////////////////////



let panels = [{
  name: "networkTreeDetailPanel",
  vueMountComponent: Vue.extend(detailPanel),
  panel: {
    title: "Network tree detail panel",
    closeBehaviour: "hide"
  },
  style: {
    height: "475px",
    left: "400px"
  }
}]

for (let index = 0; index < panels.length; index++) {
  const element = panels[index];
  const panelExtension = SpinalForgeExtention.createExtention(element);
  SpinalForgeExtention.registerExtention(element.name, panelExtension);
}