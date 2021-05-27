import { SpinalContextApp, spinalContextMenuService } from "spinal-env-viewer-context-menu-service";

import { SpinalGraphService, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service";

import { spinalPanelManagerService } from "spinal-env-viewer-panel-manager-service";

import { BIM_OBJECT_TYPE } from "spinal-env-viewer-plugin-forge/dist/Constants";

// import spinalNetworkTreeService from "../../services";
// import utilities from "../../js/utilities";

import { CONSTANTS, LinkNetworkTreeService } from "spinal-env-viewer-plugin-network-tree-service";

const SIDEBAR = "GraphManagerSideBar";



class UnLinkAutomateToProfil extends SpinalContextApp {
  constructor() {
    super("unlink automate to profile",
      "unlink automate to profile", {
      icon: "link_off",
      icon_type: "in",
      backgroundColor: "#FF0000",
      fontColor: "#FFFFFF"
    })
  }

  isShown(option) {
    const contextType = option.context.type.get();
    const nodeId = option.selectedNode.id.get();

    // if (contextType !== spinalNetworkTreeService.constants.CONTEXT_TYPE) {
    if (contextType !== CONSTANTS.CONTEXT_TYPE) {
      return Promise.resolve(-1);
    }

    const automate = SpinalGraphService.getRealNode(nodeId);

    // const hasProfilLinked = automate.hasRelation(utilities.AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
    // const hasProfilItemLinked = automate.hasRelation(utilities.OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE);

    const hasProfilLinked = automate.hasRelation(CONSTANTS.AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
    const hasProfilItemLinked = automate.hasRelation(CONSTANTS.OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE);

    if (hasProfilLinked || hasProfilItemLinked) {
      return Promise.resolve(true);
    }

    return Promise.resolve(-1);
  }

  async action(option) {
    let contextId = option.context.id.get();
    let nodeId = option.selectedNode.id.get();


    spinalPanelManagerService.openPanel("confirmUnlikProfilDialog", {
      contextId,
      callback: async (confirm) => {
        if (confirm) {
          let automates;

          if (option.selectedNode.type.get() === BIM_OBJECT_TYPE) {
            automates = [option.selectedNode];
          } else {
            // automates = await SpinalGraphService.getChildren(nodeId, [spinalNetworkTreeService.constants.NETWORK_BIMOJECT_RELATION])
            automates = await SpinalGraphService.getChildren(nodeId, [CONSTANTS.NETWORK_BIMOJECT_RELATION]);
          }

          const automatesArray = automates.map(el => SpinalGraphService.getRealNode(el.id.get()));
          for (const automate of automatesArray) {
            const automateId = automate.getId().get();

            // if (automate.hasRelation(utilities.AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE)) {
            //   utilities.unLinkDeviceToProfil(automateId);

            // } else if (automate.hasRelation(utilities.OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)) {
            //   utilities.unLinkAutomateItemToProfilItem(automateId)
            // }

            if (automate.hasRelation(CONSTANTS.AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE)) {
              LinkNetworkTreeService.unLinkDeviceToProfil(automateId);

            } else if (automate.hasRelation(utilities.OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)) {
              LinkNetworkTreeService.unLinkAutomateItemToProfilItem(automateId)
            }
          }
        }
      }
    })
  }

}

const unLinkAutomateToProfil = new UnLinkAutomateToProfil();

spinalContextMenuService.registerApp(SIDEBAR, unLinkAutomateToProfil, [3]);

export default unLinkAutomateToProfil;