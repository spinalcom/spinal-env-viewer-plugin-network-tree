import {
  SpinalContextApp,
  spinalContextMenuService
} from "spinal-env-viewer-context-menu-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";

import utilities from "../../js/utilities";

import {
  spinalPanelManagerService
} from "spinal-env-viewer-panel-manager-service";

import { BIM_OBJECT_TYPE } from "spinal-env-viewer-plugin-forge/dist/Constants";

const SIDEBAR = "GraphManagerSideBar";

import spinalNetworkTreeService from "../../services";
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
    const serviceContextType = spinalNetworkTreeService.constants.CONTEXT_TYPE;

    if (contextType !== serviceContextType) {
      return -1;
    }

    const nodeId = option.selectedNode.id.get();

    const profilLinked = await utilities.getProfilLinked(nodeId);

    if (typeof profilLinked !== "undefined") {
      // this.buttonCfg.fontColor = "#FFFFFF"
      return true
    };

    return -1;
  }

  async action(option) {
    let contextId = option.context.id.get();
    let nodeId = option.selectedNode.id.get();

    // if(option.selectedNode.type.get() === BIM_OBJECT_TYPE) {
    //   automates = [option.selectedNode];
    // } else {
    //   automates = await SpinalGraphService.getChildren(nodeId,[spinalNetworkTreeService.constants.NETWORK_BIMOJECT_RELATION])
    // }

    const data = await utilities.getDeviceAndProfilData(nodeId)


    spinalPanelManagerService.openPanel("editAutomateLinkDialog", {
      data,
      callback: async (res) => {
        const validPromises = res.valids.map(({ automateItem, profileItem }) => utilities.linkAutomateItemToProfilItem(automateItem.id, profileItem.id));

        await Promise.all(validPromises).then((result) => {
          const invaliPromises = res.invalidAutomateItems.map(el => utilities.unLinkAutomateItemToProfilItem(el.id));
          return Promise.all(invaliPromises);
        })

      }
    })
  }

}

const editAutomateLink = new EditAutomateLink();

spinalContextMenuService.registerApp(SIDEBAR, editAutomateLink, [3]);

export default editAutomateLink;