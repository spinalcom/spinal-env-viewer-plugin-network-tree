import { SpinalContextApp, spinalContextMenuService } from "spinal-env-viewer-context-menu-service";

import { spinalPanelManagerService } from "spinal-env-viewer-panel-manager-service";
import { BIM_OBJECT_TYPE } from "spinal-env-viewer-plugin-forge/dist/Constants";

const SIDEBAR = "GraphManagerSideBar";

import spinalNetworkTreeService from "../../services";

class LinkToGTBNetworkBtn extends SpinalContextApp {
   constructor() {
      super("link automate to BMS Devices",
         "link to BMS network Devices", {
         icon: "settings_input_antenna",
         icon_type: "in",
         backgroundColor: "#FF0000",
         fontColor: "#FFFFFF"
      })
   }

   isShown(option) {
      const type = option.selectedNode.type.get();
      const contextType = option.context.type.get();

      // const isAutomate = option.selectedNode.isAutomate && option.selectedNode.isAutomate.get()
      if (contextType !== spinalNetworkTreeService.constants.CONTEXT_TYPE || type === contextType || !nodeIsAutomate(option.selectedNode)) return Promise.resolve(-1);



      return Promise.resolve(true);
   }

   async action(option) {
      let contextId = option.context.id.get();
      let nodeId = option.selectedNode.id.get();
      const isAutomate = option.selectedNode.isAutomate && option.selectedNode.isAutomate.get()

      //   if (option.selectedNode.type.get() === BIM_OBJECT_TYPE) {
      //     automates = [option.selectedNode];
      //   } else {
      //     automates = await SpinalGraphService.getChildren(nodeId, [spinalNetworkTreeService.constants.NETWORK_BIMOJECT_RELATION])
      //   }

      spinalPanelManagerService.openPanel("linkToGtbDialog", {
         // automates
         nodeId,
         contextId,
         // isAutomate: isAutomate || false
      })
   }

}


const nodeIsAutomate = (selectedNode) => {
   const type = selectedNode.type.get();
   if (type === BIM_OBJECT_TYPE) {
      return selectedNode.isAutomate && selectedNode.isAutomate.get();
   }
   return true;
}



const linkToGTBNetworkBtn = new LinkToGTBNetworkBtn();

spinalContextMenuService.registerApp(SIDEBAR, linkToGTBNetworkBtn, [3]);

export default linkToGTBNetworkBtn;