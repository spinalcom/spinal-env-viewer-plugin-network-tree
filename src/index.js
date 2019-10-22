const SIDEBAR = "GraphManagerSideBar";
const HEADERBAR = "GraphManagerTopBar";

import {
  CREATE_NETWORK_BTN,
  CREATE_NETWORK_TREE_CONTEXT_BTN,
  ADD_BIMOBJECT
} from "./buttons";

import {
  spinalContextMenuService
} from "spinal-env-viewer-context-menu-service";

import "./js/register";


spinalContextMenuService.registerApp(SIDEBAR, new CREATE_NETWORK_BTN(), [3]);
spinalContextMenuService.registerApp(SIDEBAR, new ADD_BIMOBJECT(), [3]);
spinalContextMenuService.registerApp(HEADERBAR,
  new CREATE_NETWORK_TREE_CONTEXT_BTN(), [3]);