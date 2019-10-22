import {
  SpinalContextApp
} from "spinal-env-viewer-context-menu-service";

const {
  spinalPanelManagerService
} = require("spinal-env-viewer-panel-manager-service");

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

export default CreateNetWorkContext;