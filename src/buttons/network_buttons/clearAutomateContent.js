import {
   SpinalContextApp,
   spinalContextMenuService
} from "spinal-env-viewer-context-menu-service";
import { SpinalGraphService, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service";

import {
   spinalPanelManagerService
} from "spinal-env-viewer-panel-manager-service";

const SIDEBAR = "GraphManagerSideBar";

import spinalNetworkTreeService from "../../services";

class ClearAutomateContent extends SpinalContextApp {
   constructor() {
      super("Remove Items linked",
         "Remove Items linked", {
         icon: "leak_remove",
         icon_type: "in",
         backgroundColor: "#FF0000",
         fontColor: "#FFFFFF"
      })
   }

   isShown(option) {
      const contextType = option.context.type.get();
      const type = option.selectedNode.type.get();

      if (contextType === spinalNetworkTreeService.constants.CONTEXT_TYPE) return Promise.resolve(true);
      return Promise.resolve(-1);
   }

   action(option) {
      // spinalPanelManagerService.openPanel("generateAutomateContextPanel", {
      //    context: option.context.get(),
      //    selectedNode: option.selectedNode.get()
      // });
      const contextId = option.context.id.get();
      const nodeId = option.selectedNode.id.get();

      removeRelation(contextId, nodeId);

   }

}

const removeRelation = async (contextId, nodeId) => {
   const realNode = SpinalGraphService.getRealNode(nodeId);
   if (realNode.hasRelation(spinalNetworkTreeService.constants.NETWORK_BIMOJECT_RELATION, SPINAL_RELATION_PTR_LST_TYPE)) {
      const children = await SpinalGraphService.getChildrenInContext(nodeId, contextId);
      await realNode.removeRelation(spinalNetworkTreeService.constants.NETWORK_BIMOJECT_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
      return children.map(el => {
         return removeRelation(contextId, el.id.get());
      })
   }
}

const clearAutomateContent = new ClearAutomateContent();

spinalContextMenuService.registerApp(SIDEBAR, clearAutomateContent, [3]);

export default clearAutomateContent;