import constants from "./constants";
import {
  SpinalGraphService,
  SPINAL_RELATION_PTR_LST_TYPE
} from "spinal-env-viewer-graph-service";

import {
  BIM_OBJECT_TYPE
} from "spinal-env-viewer-plugin-forge/dist/Constants";


export default {
  constants: constants,
  createNetworkContext(name) {
    return SpinalGraphService.addContext(name, constants.CONTEXT_TYPE);
  },
  addNetwork(name, parentId, contextId) {
    let network = SpinalGraphService.createNode({
      name: name,
      type: constants.NETWORK_TYPE
    })

    return SpinalGraphService.addChildInContext(parentId, network, contextId,
      constants.NETWORK_RELATION,
      SPINAL_RELATION_PTR_LST_TYPE)

  },
  addBimObject(contextId, parentId, bimObjectList) {
    for (let idx = 0; idx < bimObjectList.length; idx++) {
      const {
        model,
        selection
      } = bimObjectList[idx];


      model.getBulkProperties(selection, {
        propFilter: ['name']
      }, (el) => {

        el.forEach(element => {
          // window.spinal.BimObjectService.addBIMObject(contextId,
          //   parentId,
          //   element.dbId,
          //   element.name, model)

          window.spinal.BimObjectService
            .createBIMObject(element.dbId,
              element.name, model).then(bimObject => {
              let BimObjectId = bimObject.info ? bimObject.info.id
                .get() : bimObject.id.get();

              SpinalGraphService.addChildInContext(parentId,
                BimObjectId, contextId, constants
                .NETWORK_BIMOJECT_RELATION,
                SPINAL_RELATION_PTR_LST_TYPE)
            })

        });
      });
    }
  },
  getNetworkTreeBimObjects(contextId) {
    return SpinalGraphService.findNodes(contextId, [constants.NETWORK_RELATION,
      constants.NETWORK_BIMOJECT_RELATION
    ], (node) => {
      return node.getType().get() === BIM_OBJECT_TYPE;
    })
  },
  getNetworkGroups(bimObjectId) {
    let realNode = SpinalGraphService.getRealNode(bimObjectId);
    if (!realNode) return [];

    return realNode.getParents().then(parents => {
      parents = parents.filter(el => typeof el !== "undefined");
      let groups = parents.filter(el => {
        return el.getType().get() === constants.NETWORK_TYPE;
      });

      return groups.map(el => el.info.get());

    })
  },

  getNetworkBimObjectParents(bimObjectId) {
    let realNode = SpinalGraphService.getRealNode(bimObjectId);
    if (!realNode) return [];

    return realNode.getParents([constants.NETWORK_BIMOJECT_RELATION,
      constants.NETWORK_RELATION
    ]).then(argParents => {

      let promises = argParents.map(async el => {
        if (el && el.getType().get() === BIM_OBJECT_TYPE) return el
          .info
          .get();

        let p = await this.getNetworkBimObjectParents(el ? el.info.id
          .get() : "");

        return p;

      });

      return Promise.all(promises).then(parents => {
        return parents.flat(5).filter(el => typeof el !== "undefined");
      })
    });

  }

}