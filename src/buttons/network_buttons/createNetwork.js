import {
  SpinalContextApp,
  spinalContextMenuService
} from "spinal-env-viewer-context-menu-service";

const {
  spinalPanelManagerService
} = require("spinal-env-viewer-panel-manager-service");

const SIDEBAR = "GraphManagerSideBar";

import networkService from "../../services"

class CreateNetWork extends SpinalContextApp {
  constructor() {
    super("Create Subnetwork", "Create Subnetwork", {
      icon: "device_hub",
      icon_type: "in",
      backgroundColor: "#FF00000",
      fontColor: "#FFFFFF"
    })
  }

  isShown(option) {
    let contextType = option.context.type.get();

    return Promise.resolve(contextType === networkService.constants
      .CONTEXT_TYPE ? true : -1);
  }

  action(option) {
    let dialogParams = {
      title: "Create network",
      label: "Enter name",
      selectedNode: option.selectedNode,
      context: option.context,
      createContext: false
    };

    spinalPanelManagerService.openPanel('createNetworkDialog', dialogParams);
  }

}

const createNetworkBtn = new CreateNetWork()
spinalContextMenuService.registerApp(SIDEBAR, createNetworkBtn, [3]);

export default createNetworkBtn;