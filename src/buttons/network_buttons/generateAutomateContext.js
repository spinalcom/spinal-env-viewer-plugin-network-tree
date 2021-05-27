import {
  SpinalContextApp,
  spinalContextMenuService
} from "spinal-env-viewer-context-menu-service";

import {
  spinalPanelManagerService
} from "spinal-env-viewer-panel-manager-service";

// import spinalNetworkTreeService from "../../services";
import { CONSTANTS } from "spinal-env-viewer-plugin-network-tree-service";


const SIDEBAR = "GraphManagerSideBar";


class GenerateAutomateContext extends SpinalContextApp {
  constructor() {
    super("Generate automate tree structure",
      "Generate automate tree structure", {
      icon: "leak_add",
      icon_type: "in",
      backgroundColor: "#FF0000",
      fontColor: "#FFFFFF"
    })
  }

  isShown(option) {
    const type = option.context.type.get()

    // if (type === spinalNetworkTreeService.constants.CONTEXT_TYPE) return Promise.resolve(true);
    if (type === CONSTANTS.CONTEXT_TYPE) return Promise.resolve(true);
    return Promise.resolve(-1);
  }

  action(option) {
    spinalPanelManagerService.openPanel("generateAutomateContextPanel", {
      context: option.context.get(),
      selectedNode: option.selectedNode.get()
    });
  }

}

const generateAutomateContext = new GenerateAutomateContext();

spinalContextMenuService.registerApp(SIDEBAR, generateAutomateContext, [3]);

export default generateAutomateContext;