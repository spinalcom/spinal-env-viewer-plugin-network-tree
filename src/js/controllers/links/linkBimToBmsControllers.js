import { SpinalGraphService } from "spinal-env-viewer-graph-service";
import networkService from "../../network/networkService";

import {
  AttributesUtilities,
  LinkBmsDeviceService,
} from "spinal-env-viewer-plugin-network-tree-service";
import { SpinalBmsDevice } from "spinal-model-bmsnetwork";

export default {
  getBmsDevicesContextTreeStructure() {
    return networkService.getDeviceContextTreeStructure();
  },

  getAutomateBims(nodeId, contextId) {
    const nodeRef = SpinalGraphService.getInfo(nodeId);
    if (nodeRef.isAutomate && nodeRef.isAutomate.get()) return [nodeRef.get()];

    return SpinalGraphService.findInContext(nodeId, contextId, (node) => {
      if (node.info.isAutomate && node.info.isAutomate.get()) {
        SpinalGraphService._addNode(node);
        return true;
      }

      return false;
    }).then((result) => {
      return result.map((el) => el.get());
    });
  },

  async createLinkBetweenBimAndBms(bmsContextId, validResultList, percent) {
    const listeLength = validResultList.length;
    let isError = false;
    let counter = 0;

    while (!isError && listeLength > counter) {
      const { profileItem, automateItem } = validResultList[counter];
      if (profileItem && automateItem) {
        try {
          await LinkBmsDeviceService.LinkBmsDeviceToBimDevices(
            bmsContextId,
            profileItem.id,
            automateItem.id
          );

          counter++;

          percent = Math.floor((100 * counter) / listeLength);
        } catch (error) {
          counter++;
          // console.error(error);
          // isError = true;
        }
      }
    }
  },

  getLinkResultBetweenBimAndBms(
    bmsAttributeName,
    contextSelected,
    networkSelected,
    deviceSelected,
    listObj,
    bimAutomates,
    bimAttributeName,
    configuration
  ) {
    return this.getProperties(
      bmsAttributeName,
      contextSelected,
      networkSelected,
      deviceSelected,
      listObj,
      bimAutomates,
      bimAttributeName
    )
      .then(([bmsDevices, bimDevices]) => {
        const res = {
          valids: [],
          invalidAutomateItems: [...bimDevices.invalidItems],
          invalidProfileItems: [],
        };

        const { bimData, bmsData } = configuration;

        const bmsDeviceObj = this.transFormToObj(
          bmsDevices,
          bmsData.useFunction,
          bmsData.callback.code
        );

        for (const bim of bimDevices.validItems) {
          const bimPropValue = this._formatProperty(
            bim.property.displayValue,
            bimData.useFunction,
            bimData.callback.code
          );
          let found = bmsDeviceObj[bimPropValue];
          if (found) {
            delete bmsDeviceObj[bimPropValue];
            res.valids.push({ automateItem: bim, profileItem: found });
          } else {
            res.invalidAutomateItems.push(bim);
          }
        }

        const keys = Object.keys(bmsDeviceObj);
        res.invalidProfileItems = keys.map((key) => bmsDeviceObj[key]);

        return res;
      })
      .catch((err) => {
        throw err;
      });
  },

  getProperties(
    bmsAttributeName,
    contextSelected,
    networkSelected,
    deviceSelected,
    listObj,
    bimAutomates,
    bimAttributeName
  ) {
    const bmsPropsProm = this._getBmsDevicesProperties(
      bmsAttributeName,
      contextSelected,
      networkSelected,
      deviceSelected,
      listObj
    );

    const bimPropsProm = this._getAutomateBimProperties(
      bimAutomates,
      bimAttributeName
    );

    return Promise.all([bmsPropsProm, bimPropsProm]);
  },

  _getBmsDevicesProperties(
    attributeName,
    contextSelected,
    networkSelected,
    deviceSelected,
    listObj
  ) {
    const bmsDevices = this._findDevices(
      contextSelected,
      networkSelected,
      deviceSelected,
      listObj
    );

    const promises = bmsDevices.map(async (el) => {
      el.property = await AttributesUtilities.findSpinalAttributeById(
        el.id,
        attributeName
      );
      return el;
    });

    return Promise.all(promises);
  },

  _findDevices(contextSelected, networkSelected, deviceSelected, listObj) {
    const nodeId = deviceSelected || networkSelected || contextSelected;

    if (nodeId === deviceSelected) {
      return listObj.devices.filter((el) => el.id === nodeId);
    } else if (nodeId === networkSelected) {
      const found = listObj.networks.find((el) => el.id === nodeId);
      return found && found.devices ? found.devices : [];
    } else if (nodeId === contextSelected) {
      const devices = [];
      const found = listObj.tree.find((el) => el.id === nodeId);

      if (found && found.networks) {
        for (const network of found.networks) {
          if (network.devices) {
            devices.push(...network.devices);
          }
        }
      }

      return devices;
    }
  },

  _getAutomateBimProperties(bimAutomates, attributeName) {
    const promises = bimAutomates.map(async (el) => {
      //   const fileName = spinal.spinalGraphService
      //     .getInfo(el.bimFileId)
      //     .name.get();

      const { bimFileId, dbid } = el;

      const model = window.spinal.BimObjectService.getModelByBimfile(bimFileId);

      if (!model) throw "make sure your load all scene";

      el.property = await AttributesUtilities.findAttribute(
        model,
        dbid,
        attributeName
      );
      return el;
    });

    try {
      return Promise.all(promises).then((result) => {
        return {
          validItems: result.filter((el) => el.property),
          invalidItems: result.filter((el) => !el.property),
        };
      });
    } catch (error) {
      throw error;
    }
  },

  _formatProperty(propertyValue, useFunction, callback) {
    if (useFunction) {
      return this._formatValue(propertyValue, callback);
    }

    return propertyValue;
  },

  _formatValue(value, callback) {
    return eval(`(${callback})('${value}')`);
  },

  transFormToObj(liste, useFunction, callback) {
    const obj = {};

    for (const item of liste) {
      const prop = this._formatProperty(
        item.property.displayValue,
        useFunction,
        callback
      );
      obj[prop] = item;
    }

    return obj;

    // bmsDevices.find((el, i) => {
    //   if (el.property) {
    //     const bmsPropValue = console.log(bimPropValue, bmsPropValue);
    //     if (bmsPropValue == bimPropValue) {
    //       index = i;
    //       return true;
    //     }
    //   }

    //   return false;
    // });
  },
};
