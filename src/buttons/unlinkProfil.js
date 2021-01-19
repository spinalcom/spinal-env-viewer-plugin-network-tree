import { SpinalContextApp, spinalContextMenuService } from "spinal-env-viewer-context-menu-service";

import { SpinalGraphService, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service";
  
import { spinalPanelManagerService } from "spinal-env-viewer-panel-manager-service";

import { BIM_OBJECT_TYPE } from "spinal-env-viewer-plugin-forge/dist/Constants";
  
const SIDEBAR = "GraphManagerSideBar";

import spinalNetworkTreeService from "../services";
  
import utilities from "../js/utilities";

class UnLinkAutomateToProfil extends SpinalContextApp {
  constructor() {
    super("unlink profil",
      "unlink profil", {
        icon: "link_off",
        icon_type: "in",
        backgroundColor: "#FF0000",
        fontColor: "#FFFFFF"
      })
  }

  isShown(option) {
    const contextType = option.context.type.get();
    const nodeType = option.selectedNode.type.get();
    
    if(contextType === spinalNetworkTreeService.constants.CONTEXT_TYPE ){
      // && nodeType === spinalNetworkTreeService.constants.NETWORK_TYPE
        return Promise.resolve(true);
    }
    return Promise.resolve(-1);
  }

  async action(option) {
    let contextId = option.context.id.get();
    let nodeId = option.selectedNode.id.get();
    let automates;

    if(option.selectedNode.type.get() === BIM_OBJECT_TYPE) {
      automates = [option.selectedNode];
    } else {
      automates = await SpinalGraphService.getChildren(nodeId,[spinalNetworkTreeService.constants.NETWORK_BIMOJECT_RELATION])
    }


    spinalPanelManagerService.openPanel("confirmUnlikProfilDialog",{
      contextId,
      callback : async (confirm) => {
        if(confirm) {
          const automatesArray = automates.map(el => SpinalGraphService.getRealNode(el.id.get()));
          for (const automate of automatesArray) {
            const automateId = automate.getId().get();

            if(automate.hasRelation(utilities.AUTOMATES_TO_PROFILE_RELATION,SPINAL_RELATION_PTR_LST_TYPE)) {
              utilities.unLinkDeviceToProfil(automateId);

            } else if(automate.hasRelation(utilities.OBJECT_TO_BACNET_ITEM_RELATION,SPINAL_RELATION_PTR_LST_TYPE)) {

              utilities.unLinkAutomateItemToProfilItem(automateId)
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