import { SpinalGraphService, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service"
import { SpinalBmsDevice, SpinalBmsEndpoint } from "spinal-model-bmsnetwork";
// import spinalNetworkTreeService from '../../services/index'
import linkAutomateToProfilUtilities from "./linkAutomateToProfil";

import { ATTRIBUTE_CATEGORY } from "../generateAutomateService";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";

import linkDeviceProfileService from "./linkAutomateToProfil";

export default {

   async LinkBmsDeviceToBimDevices(bmsContextId, bmsDeviceId, bimDeviceId) {

      const profilId = await this._getBacnetProfilLinked(bimDeviceId);

      if (profilId) {
         const promises = [this.getEndpointsMap(bmsContextId, bmsDeviceId), this._getAutomateItems(bimDeviceId)];
         const [bmsDevicesMap, bimDevicesMap] = await Promise.all(promises);
         console.log(bmsDevicesMap, bimDevicesMap);
         const promises2 = Array.from(bimDevicesMap.keys()).map(key => {
            const bmsElement = bmsDevicesMap.get(key);
            const value = bimDevicesMap.get(key);
            if (bmsElement && value) {
               return Promise.all([
                  SpinalGraphService.addChild(value.parentId, bmsElement.id, SpinalBmsEndpoint.relationName, SPINAL_RELATION_PTR_LST_TYPE),
                  SpinalGraphService.addChild(bmsElement.id, value.nodeId, linkDeviceProfileService.OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
               ])
            }
            return;
         })

         await Promise.all(promises2);
         await SpinalGraphService.addChild(bmsDeviceId, profilId, linkDeviceProfileService.AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
         await SpinalGraphService.addChild(bimDeviceId, bmsDeviceId, SpinalBmsDevice.relationName, SPINAL_RELATION_PTR_LST_TYPE);
         return;

      } else {
         throw new Error(`${bimDeviceId} has no profil linked`)
      }

   },

   async unLinkBmsDeviceToBimDevices(bmsContextId, bmsDeviceId, bimDeviceId) {

      const profilId = await this._getBacnetProfilLinked(bimDeviceId);

      if (profilId) {
         const promises = [this.getEndpointsMap(bmsContextId, bmsDeviceId), this._getAutomateItems(bimDeviceId)];
         const [bmsDevicesMap, bimDevicesMap] = await Promise.all(promises);

         console.log(bmsDevicesMap, bimDevicesMap);
         const promises2 = Array.from(bimDevicesMap.keys()).map(key => {
            const bmsElement = bmsDevicesMap.get(key);
            const value = bimDevicesMap.get(key);
            if (bmsElement && value) {
               return Promise.all([
                  SpinalGraphService.removeChild(value.parentId, bmsElement.id, SpinalBmsEndpoint.relationName, SPINAL_RELATION_PTR_LST_TYPE),
                  SpinalGraphService.removeChild(bmsElement.id, value.nodeId, linkDeviceProfileService.OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
               ])
            }
            return;
         })

         await Promise.all(promises2);
         await SpinalGraphService.removeChild(bmsDeviceId, profilId, linkDeviceProfileService.AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
         await SpinalGraphService.removeChild(bimDeviceId, bmsDeviceId, SpinalBmsDevice.relationName, SPINAL_RELATION_PTR_LST_TYPE);
         console.log("end...");
         return;
      }
   },

   getEndpointsMap(bmsContextId, bmsDeviceId) {
      const bmsDeviceMap = new Map();

      return SpinalGraphService.findInContext(bmsDeviceId, bmsContextId, (node) => {
         if (node.getType().get() === SpinalBmsEndpoint.nodeTypeName) {
            SpinalGraphService._addNode(node)
            bmsDeviceMap.set(node.info.idNetwork.get(), node.info.get());
            return true;
         }
         return false;
      }).then((nodes) => {

         return bmsDeviceMap;

         // const promises = nodes.map(async el => {
         //    const realNode = SpinalGraphService.getRealNode(el.id.get());
         //    const element = await realNode.getElement();
         //    const _temp = element.get()
         //    _temp.nodeId = el.id.get();
         //    bmsDeviceMap.set(_temp.id, _temp);
         //    return _temp;
         // })

         // return Promise.all(promises).then(() => {
         //    return bmsDeviceMap;
         // })
      })
   },

   _getAutomateItems(automateId) {
      const bimDeviceMap = new Map();

      return linkAutomateToProfilUtilities.getDeviceAndProfilData(automateId).then((result) => {
         const promises = result.valids.map(async ({ automateItem, profileItem }) => {
            const attrs = await this.getItemIO(profileItem.id);
            for (const attr of attrs) {
               attr.parentId = automateItem.id;
               bimDeviceMap.set((parseInt(attr.IDX) + 1), attr);
            }
            return;
         })

         return Promise.all(promises).then((result) => {
            return bimDeviceMap;
         })

      })
   },

   getItemIO(nodeId) {
      return this.getItems(nodeId).then((children) => {

         const promises = children.map(async child => {
            const realNode = SpinalGraphService.getRealNode(child.id.get());

            const attributes = await serviceDocumentation.getAttributesByCategory(realNode, ATTRIBUTE_CATEGORY);
            // console.log("attributes", attributes)
            const obj = {
               nodeId: child.id.get()
            };
            attributes.forEach(el => {
               obj[el.label.get()] = el.value.get();
            })

            return obj;
         })

         return Promise.all(promises).then((result) => {
            return result;
            // return result.flat();
         })
      })
   },

   getItems(nodeId) {
      return SpinalGraphService.getChildren(nodeId, ["hasInputs", "hasOutputs"]).then((children) => {

         const promises = children.map(el => SpinalGraphService.getChildren(el.id.get(), ["hasInput", "hasOutput"]));
         return Promise.all(promises).then((result) => {
            return result.flat();
         })
      })
   },

   _getBacnetProfilLinked(bimDeviceId) {
      return SpinalGraphService.getChildren(bimDeviceId, [linkDeviceProfileService.AUTOMATES_TO_PROFILE_RELATION]).then((children) => {
         if (children.length > 0) return children[0].id.get()
      })
   },

   _createNodeLink(profilId, deviceId, bimObjectId, endpointId, profilItemId) {
      const promises = [SpinalGraphService.addChild(bimObjectId, endpointId, SpinalBmsEndpoint.relationName, SPINAL_RELATION_PTR_LST_TYPE),
      SpinalGraphService.addChild(endpointId, profilItemId, linkDeviceProfileService.OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)]
      return Promise.all(promises).then(() => {
         return SpinalGraphService.addChild(deviceId, profilId, linkDeviceProfileService.AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
      })
   }
}