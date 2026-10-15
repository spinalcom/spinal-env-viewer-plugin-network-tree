import Vue from "vue";

import { SpinalForgeExtention } from "spinal-env-viewer-panel-manager-service_spinalforgeextention";


import { GENERATE_AUTOMATE_CONTEXT_PANEL, NETWORK_TREE_DETAIL_PANEL } from "../../js/constants";


import GenerateAutomateContext from "./generateAutomateContext.vue";
import detailPanel from "./detailPanel.vue";


const panels = [
  {
    name: GENERATE_AUTOMATE_CONTEXT_PANEL,
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
    name: NETWORK_TREE_DETAIL_PANEL,
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