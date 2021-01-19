import {
  SpinalContextApp,
  spinalContextMenuService
} from "spinal-env-viewer-context-menu-service";

const {
  spinalPanelManagerService,
  
} = require("spinal-env-viewer-panel-manager-service");

const HEADERBAR = "GraphManagerTopBar";


class CreateNetWorkContext extends SpinalContextApp {
  constructor() {
    super("Create Network Tree Context", "Create Network Tree Context", {
      icon: "device_hub",
      icon_type: "in",
      backgroundColor: "#FF00000",
      fontColor: "#FFFFFF"
    })
  }

  isShown() {
    return Promise.resolve(true);
  }

  action() {
    let dialogParams = {
      title: "Create network context",
      label: "Enter context name",
      createContext: true
    };

    spinalPanelManagerService.openPanel('createNetworkDialog', dialogParams);
  }

}


const createNetworkContextBtn = new CreateNetWorkContext()

spinalContextMenuService.registerApp(HEADERBAR, createNetworkContextBtn, [3]);

export default createNetworkContextBtn;