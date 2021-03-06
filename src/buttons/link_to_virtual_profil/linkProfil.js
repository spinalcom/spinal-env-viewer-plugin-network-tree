import {
  SpinalContextApp,
  spinalContextMenuService
} from "spinal-env-viewer-context-menu-service";

import {
  spinalPanelManagerService
} from "spinal-env-viewer-panel-manager-service";

import { CONSTANTS } from "spinal-env-viewer-plugin-network-tree-service";

const SIDEBAR = "GraphManagerSideBar";

// import spinalNetworkTreeService from "../../services";

class LinkAutomateToProfil extends SpinalContextApp {
  constructor() {
    super("link automate to profile",
      "link automate to profile", {
      icon: "add_link",
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

  async action(option) {
    let contextId = option.context.id.get();
    let nodeId = option.selectedNode.id.get();


    // if (option.selectedNode.type.get() === BIM_OBJECT_TYPE && option.selectedNode.isAutomate && option.selectedNode.isAutomate.get()) {
    //   automates = [option.selectedNode];
    // } else {
    //   automates = await SpinalGraphService.getChildren(nodeId, [spinalNetworkTreeService.constants.NETWORK_BIMOJECT_RELATION])
    // }

    spinalPanelManagerService.openPanel("linkAutomateToProfilDialog", {
      contextId,
      nodeId
    })
  }

}




const linkAutomateToProfil = new LinkAutomateToProfil();

spinalContextMenuService.registerApp(SIDEBAR, linkAutomateToProfil, [3]);

export default linkAutomateToProfil;