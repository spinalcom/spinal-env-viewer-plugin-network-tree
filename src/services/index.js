import constants from "./constants";
import {
  SpinalGraphService,
  SPINAL_RELATION_PTR_LST_TYPE
} from "spinal-env-viewer-graph-service";


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

  }
}