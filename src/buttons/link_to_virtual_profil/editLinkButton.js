import {
  SpinalContextApp,
  spinalContextMenuService
} from "spinal-env-viewer-context-menu-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";

// import utilities from "../../js/utilities";
// import spinalNetworkTreeService from "../../services";

import { LinkNetworkTreeService, CONSTANTS } from "spinal-env-viewer-plugin-network-tree-service";

import {
  spinalPanelManagerService
} from "spinal-env-viewer-panel-manager-service";

import { BIM_OBJECT_TYPE } from "spinal-env-viewer-plugin-forge/dist/Constants";

const SIDEBAR = "GraphManagerSideBar";

const editLinkIcon = require("../../assets/link-edit.svg");

class EditAutomateLink extends SpinalContextApp {
  constructor() {
    super("Edit link between automate and profile",
      "Edit link between automate and profile", {
      icon: editLinkIcon,
      icon_type: "src",
      backgroundColor: "#FF0000",
      fontColor: "#FFFFFF"
    })
  }

  async isShown(option) {
    const contextType = option.context.type.get();

    const serviceContextType = CONSTANTS.CONTEXT_TYPE;

    if (contextType !== serviceContextType) {
      return -1;
    }

    const nodeId = option.selectedNode.id.get();

    const profilLinked = await LinkNetworkTreeService.getProfilLinked(nodeId);

    if (typeof profilLinked !== "undefined") {

      return true
    };

    return -1;
  }

  async action(option) {
    let contextId = option.context.id.get();
    let nodeId = option.selectedNode.id.get();

    // const data = await utilities.getDeviceAndProfilData(nodeId)
    // const data = await LinkNetworkTreeService.getDeviceAndProfilData(nodeId);


    spinalPanelManagerService.openPanel("editAutomateLinkDialog", {
      contextId,
      nodeId,
      // data,
      // callback: async (res) => {
      //   // const validPromises = res.valids.map(({ automateItem, profileItem }) => utilities.linkAutomateItemToProfilItem(automateItem.id, profileItem.id));
      //   const validPromises = res.valids.map(({ automateItem, profileItem }) => LinkNetworkTreeService.linkAutomateItemToProfilItem(automateItem.id, profileItem.id));

      //   await Promise.all(validPromises).then(() => {
      //     // const invaliPromises = res.invalidAutomateItems.map(el => utilities.unLinkAutomateItemToProfilItem(el.id));
      //     const invaliPromises = res.invalidAutomateItems.map(el => LinkNetworkTreeService.unLinkAutomateItemToProfilItem(el.id));
      //     return Promise.all(invaliPromises);
      //   })

      // }
    })
  }

}

const editAutomateLink = new EditAutomateLink();

spinalContextMenuService.registerApp(SIDEBAR, editAutomateLink, [3]);

export default editAutomateLink;