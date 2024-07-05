/*
 * Copyright 2024 SpinalCom - www.spinalcom.com
 * 
 * This file is part of SpinalCore.
 * 
 * Please read all of the following terms and conditions
 * of the Software license Agreement ("Agreement")
 * carefully.
 * 
 * This Agreement is a legally binding contract between
 * the Licensee (as defined below) and SpinalCom that
 * sets forth the terms and conditions that govern your
 * use of the Program. By installing and/or using the
 * Program, you agree to abide by all the terms and
 * conditions stated or referenced herein.
 * 
 * If you do not agree to abide by these terms and
 * conditions, do not demonstrate your acceptance and do
 * not install or use the Program.
 * You should have received a copy of the license along
 * with this file. If not, see
 * <http://resources.spinalcom.com/licenses.pdf>.
 */

import {
  SpinalContextApp,
  spinalContextMenuService,
} from "spinal-env-viewer-context-menu-service";
import {
  SpinalGraphService,
  SPINAL_RELATION_PTR_LST_TYPE,
} from "spinal-env-viewer-graph-service";

// import spinalNetworkTreeService from "../../services";
import {
  CONSTANTS,
  NetworkTreeService,
} from "spinal-env-viewer-plugin-network-tree-service";
import * as lodash from "lodash";

const SIDEBAR = "GraphManagerSideBar";

const automateWatched = new Map();

class SeeSubItems extends SpinalContextApp {
  constructor() {
    super("see sub-items", "See sub-items", {
      icon: "visibility",
      icon_type: "",
      backgroundColor: "#FF0000",
      fontColor: "#FFFFFF",
    });
  }

  isShown(option) {
    const contextType = option.context.type.get();

    // if (contextType !== spinalNetworkTreeService.constants.CONTEXT_TYPE) return Promise.resolve(-1);
    if (contextType !== CONSTANTS.CONTEXT_TYPE) return Promise.resolve(-1);

    const id = option.selectedNode.id.get();
    const realNode = SpinalGraphService.getRealNode(id);

    // if (realNode.hasRelation(spinalNetworkTreeService.constants.NETWORK_BIMOJECT_RELATION, SPINAL_RELATION_PTR_LST_TYPE)) {
    if (
      realNode.hasRelation(
        CONSTANTS.NETWORK_BIMOJECT_RELATION,
        SPINAL_RELATION_PTR_LST_TYPE
      )
    ) {
      // this.buttonCfg.icon = typeof automateWatched.get(id) === "undefined" ? "visibility" : "visibility_off";
      return Promise.resolve(true);
    }

    return Promise.resolve(-1);
  }

  async action({ selectedNode, context }) {
    const node = selectedNode.get();
    const children = await NetworkTreeService.getBimObjectsLinked(node.id);

    const bims = [node, ...children.map((el) => el.get())];

    const objs = [];
    const grouped = lodash.groupBy(bims, (item) => item.bimFileId);
    lodash.forEach(grouped, (value, key) => {
      objs.push({
        bimFileId: key,
        dbIds: value.map((el) => el.dbid),
      });
    });
    const resItems = objs.map((el) => {
      return {
        model: spinal.BimObjectService.getModelByBimfile(el.bimFileId),
        selection: el.dbIds,
      };
    });
    window.spinal.ForgeViewer.viewer.impl.visibilityManager.aggregateIsolate(resItems);
  }
}

// const convertColorToRGB = (hexColor) => {
//   var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
//   return result
//     ? {
//         r: parseInt(result[1], 16),
//         g: parseInt(result[2], 16),
//         b: parseInt(result[3], 16),
//       }
//     : null;
// };

// const convertRGBTOVector = (hexColor) => {
//   const rgbColor = convertColorToRGB(hexColor);
//   return rgbColor
//     ? // eslint-disable-next-line no-undef
//       new THREE.Vector4(
//         rgbColor.r / 255,
//         rgbColor.g / 255,
//         rgbColor.b / 255,
//         0.7
//       )
//     : // eslint-disable-next-line no-undef
//       new THREE.Vector4(1, 0, 0, 0);
// };

const seeSubItems = new SeeSubItems();
spinalContextMenuService.registerApp(SIDEBAR, seeSubItems, [3]);

export default seeSubItems;
