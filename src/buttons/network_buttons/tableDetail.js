import {
  SpinalContextApp,
  spinalContextMenuService
} from "spinal-env-viewer-context-menu-service";

import {
  spinalPanelManagerService
} from "spinal-env-viewer-panel-manager-service";

// import networkTreeService from "../../services";
import { CONSTANTS } from "spinal-env-viewer-plugin-network-tree-service";
const SIDEBAR = "GraphManagerSideBar";




class TableDetail extends SpinalContextApp {
  constructor() {
    super(
      "See Detail",
      "See Detail", {
      icon: "view_column",
      icon_type: "in",
      backgroundColor: "#FF0000",
      fontColor: "#FFFFFF"
    }
    );
  }

  isShown(option) {
    let contextType = option.selectedNode.type.get();
    // return contextType === networkTreeService.constants.CONTEXT_TYPE ? Promise.resolve(true) : Promise.resolve(-1);
    return contextType === CONSTANTS.CONTEXT_TYPE ? Promise.resolve(true) : Promise.resolve(-1);
  }

  action(option) {
    spinalPanelManagerService.openPanel("networkTreeDetailPanel", option.selectedNode.get());
  }

}


const tableDetailBtn = new TableDetail()

spinalContextMenuService.registerApp(SIDEBAR, tableDetailBtn, [3]);


export default tableDetailBtn;