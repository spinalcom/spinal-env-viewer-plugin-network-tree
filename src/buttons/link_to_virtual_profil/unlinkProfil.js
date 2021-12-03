import {
  SpinalContextApp,
  spinalContextMenuService,
} from "spinal-env-viewer-context-menu-service";

import {
  SpinalGraphService,
  SPINAL_RELATION_PTR_LST_TYPE,
} from "spinal-env-viewer-graph-service";

import { spinalPanelManagerService } from "spinal-env-viewer-panel-manager-service";

import { BIM_OBJECT_TYPE } from "spinal-env-viewer-plugin-forge/dist/Constants";

// import spinalNetworkTreeService from "../../services";
// import utilities from "../../js/utilities";

import { CONSTANTS } from "spinal-env-viewer-plugin-network-tree-service";

const SIDEBAR = "GraphManagerSideBar";

class UnLinkAutomateToProfil extends SpinalContextApp {
  constructor() {
    super("unlink automate(s) to profile", "unlink automate(s) to profile", {
      icon: "link_off",
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

    // const hasProfilLinked = automate.hasRelation(utilities.AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
    // const hasProfilItemLinked = automate.hasRelation(utilities.OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE);

    // const hasProfilLinked = automate.hasRelation(
    //   CONSTANTS.AUTOMATES_TO_PROFILE_RELATION,
    //   SPINAL_RELATION_PTR_LST_TYPE
    // );

    // const hasProfilItemLinked = automate.hasRelation(
    //   CONSTANTS.OBJECT_TO_BACNET_ITEM_RELATION,
    //   SPINAL_RELATION_PTR_LST_TYPE
    // );

    const found = [
      CONSTANTS.NETWORK_RELATION,
      CONSTANTS.NETWORK_BIMOJECT_RELATION,
    ].findIndex((el) => automate.hasRelation(el, SPINAL_RELATION_PTR_LST_TYPE));

    return Promise.resolve(found);
  }

  async action(option) {
    let contextId = option.context.id.get();
    let nodeId = option.selectedNode.id.get();

    spinalPanelManagerService.openPanel("confirmUnlikProfilDialog", {
      contextId,
      nodeId,
    });
  }
}

const unLinkAutomateToProfil = new UnLinkAutomateToProfil();

spinalContextMenuService.registerApp(SIDEBAR, unLinkAutomateToProfil, [3]);

export default unLinkAutomateToProfil;
