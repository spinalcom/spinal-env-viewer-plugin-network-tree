import Vue from "vue";

import {
  SpinalForgeExtention,
} from "spinal-env-viewer-panel-manager-service_spinalforgeextention";


import GenerateAutomateContext from "./generateAutomateContext.vue";
import detailPanel from "./detailPanel.vue";


const panels = [
  {
    name: "generateAutomateContextPanel",
    vueMountComponent: Vue.extend(GenerateAutomateContext),
    panel: {
      title: "Generate Automate",
      closeBehaviour: "hide",
    },
    style: {
      height: "475px",
      left: "400px",
    },
  },
  {
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
  }
];


for (const element of panels) {
  const panelExtension = SpinalForgeExtention.createExtention(element);
  SpinalForgeExtention.registerExtention(element.name, panelExtension);
}