import {
  SpinalContextApp,
  spinalContextMenuService,
} from "spinal-env-viewer-context-menu-service";

import { spinalPanelManagerService } from "spinal-env-viewer-panel-manager-service";

import { CONSTANTS } from "spinal-env-viewer-plugin-network-tree-service";
import {
  SpinalGraphService,
  SPINAL_RELATION_PTR_LST_TYPE,
} from "spinal-env-viewer-graph-service";

const SIDEBAR = "GraphManagerSideBar";

// import spinalNetworkTreeService from "../../services";

class LinkAutomateToProfil extends SpinalContextApp {
  constructor() {
    super("link automate to profile", "link automate to profile", {
      icon: "add_link",
      icon_type: "in",
      backgroundColor: "#FF0000",
      fontColor: "#FFFFFF",
    });
  }

  isShown(option) {
    const contextType = option.context.type.get();
    const contextId = option.context.id.get();
    const nodeId = option.selectedNode.id.get();

    if (contextType !== CONSTANTS.CONTEXT_TYPE) return Promise.resolve(-1);
    if (contextId === nodeId && contextType == CONSTANTS.CONTEXT_TYPE)
      return Promise.resolve(true);

    const automate = SpinalGraphService.getRealNode(nodeId);

    const found = [
      CONSTANTS.NETWORK_RELATION,
      CONSTANTS.NETWORK_BIMOJECT_RELATION,
    ].findIndex((el) => automate.hasRelation(el, SPINAL_RELATION_PTR_LST_TYPE));

    return Promise.resolve(found);
  }

  async action(option) {
    let contextId = option.context.id.get();
    let nodeId = option.selectedNode.id.get();

    spinalPanelManagerService.openPanel("linkAutomateToProfilDialog", {
      contextId,
      nodeId,
    });
  }
}

const linkAutomateToProfil = new LinkAutomateToProfil();

spinalContextMenuService.registerApp(SIDEBAR, linkAutomateToProfil, [3]);

export default linkAutomateToProfil;
