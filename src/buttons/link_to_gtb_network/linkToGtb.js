import {
   SpinalContextApp,
   spinalContextMenuService
} from "spinal-env-viewer-context-menu-service";
import { SpinalGraphService } from "spinal-env-viewer-graph-service";

import {
   spinalPanelManagerService
} from "spinal-env-viewer-panel-manager-service";
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
      const type = option.selectedNode.type.get()
      const isAutomate = option.selectedNode.isAutomate && option.selectedNode.isAutomate.get()
      if (type === spinalNetworkTreeService.constants.CONTEXT_TYPE || isAutomate) return Promise.resolve(true);

      return Promise.resolve(-1);
   }

   async action(option) {
      let contextId = option.context.id.get();
      let nodeId = option.selectedNode.id.get();


      //   if (option.selectedNode.type.get() === BIM_OBJECT_TYPE) {
      //     automates = [option.selectedNode];
      //   } else {
      //     automates = await SpinalGraphService.getChildren(nodeId, [spinalNetworkTreeService.constants.NETWORK_BIMOJECT_RELATION])
      //   }

      spinalPanelManagerService.openPanel("linkToGtbDialog", {
         // automates
         nodeId,
         contextId
      })
   }

}




const linkToGTBNetworkBtn = new LinkToGTBNetworkBtn();

spinalContextMenuService.registerApp(SIDEBAR, linkToGTBNetworkBtn, [3]);

export default linkToGTBNetworkBtn;