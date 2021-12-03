import { BIM_OBJECT_TYPE } from "spinal-env-viewer-plugin-forge/dist/Constants";
import {
  CONSTANTS,
  LinkNetworkTreeService,
} from "spinal-env-viewer-plugin-network-tree-service";

import {
  SpinalGraphService,
  SPINAL_RELATION_PTR_LST_TYPE,
} from "spinal-env-viewer-graph-service";

const lodash = require("lodash");

export default {
  async getFloors(contextId) {
    return SpinalGraphService.getChildren(contextId, [
      CONSTANTS.NETWORK_RELATION,
      CONSTANTS.NETWORK_BIMOJECT_RELATION,
    ]);
  },
  async getContextAutomates(nodeId) {
    const floors = await this.getFloors(nodeId);

    const promises = floors.map((el) => this.getAutomates(el.id.get()));
    return Promise.all(promises).then((result) => {
      return lodash.flattenDeep(result);
    });
  },
  async getAutomates(nodeId) {
    const nodeRef = SpinalGraphService.getInfo(nodeId);
    return nodeRef.isAutomate && nodeRef.isAutomate.get()
      ? [nodeRef]
      : await SpinalGraphService.getChildren(nodeId, [
          CONSTANTS.NETWORK_BIMOJECT_RELATION,
        ]);
  },

  async unLink(contextId, nodeId, removeAlsoBmsDevice) {
    let automates =
      contextId === nodeId
        ? await this.getContextAutomates(contextId)
        : await this.getAutomates(nodeId);

    console.log("automates", automates);
    console.log(automates.map((el) => el.name.get()));

    const promises = automates.map((el) => {
      try {
        if (el.isAutomate && el.isAutomate.get()) {
          return LinkNetworkTreeService.unLinkDeviceToProfil(
            el.id.get(),
            undefined,
            removeAlsoBmsDevice
          );
        }

        return LinkNetworkTreeService.unLinkAutomateItemToProfilItem(
          el.id.get(),
          undefined,
          removeAlsoBmsDevice
        );
      } catch (error) {
        console.error(el.name.get(), error);
      }
    });

    return Promise.all(promises);

    // const automatesArray = automates.map((el) =>
    //   SpinalGraphService.getRealNode(el.id.get())
    // );

    // let counter = 0;

    // while (counter < automatesArray.length) {
    //   const automate = automatesArray[counter];
    //   const automateId = automate.getId().get();
    //   const isAutomate = automate.hasRelation(
    //     CONSTANTS.AUTOMATES_TO_PROFILE_RELATION,
    //     SPINAL_RELATION_PTR_LST_TYPE
    //   );
    //   if (isAutomate) {
    //     await LinkNetworkTreeService.unLinkDeviceToProfil(
    //       automateId,
    //       undefined,
    //       removeAlsoBmsDevice
    //     );
    //     counter++;
    //     continue;
    //   }
    //   const isAutomateItem = automate.hasRelation(
    //     utilities.OBJECT_TO_BACNET_ITEM_RELATION,
    //     SPINAL_RELATION_PTR_LST_TYPE
    //   );

    //   if (isAutomateItem) {
    //     await LinkNetworkTreeService.unLinkAutomateItemToProfilItem(
    //       automateId,
    //       undefined,
    //       removeAlsoBmsDevice
    //     );
    //   }
    // }

    // for (const automate of automatesArray) {
    //   const automateId = automate.getId().get();

    // if (
    //   automate.hasRelation(
    //     CONSTANTS.AUTOMATES_TO_PROFILE_RELATION,
    //     SPINAL_RELATION_PTR_LST_TYPE
    //   )
    // ) {
    //   LinkNetworkTreeService.unLinkDeviceToProfil(
    //     automateId,
    //     undefined,
    //     removeAlsoBmsDevice
    //   );
    // } else if (
    //   automate.hasRelation(
    //     utilities.OBJECT_TO_BACNET_ITEM_RELATION,
    //     SPINAL_RELATION_PTR_LST_TYPE
    //   )
    // ) {
    //   LinkNetworkTreeService.unLinkAutomateItemToProfilItem(
    //     automateId,
    //     undefined,
    //     removeAlsoBmsDevice
    //   );
    // }
    // }
  },
};
