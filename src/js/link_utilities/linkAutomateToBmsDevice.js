import { SpinalGraphService, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service"
import { SpinalBmsEndpoint } from "spinal-model-bmsnetwork";
// import spinalNetworkTreeService from '../../services/index'
import linkAutomateToProfilUtilities from "./linkAutomateToProfil";

import { ATTRIBUTE_CATEGORY } from "../generateAutomateService";
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";


export default {

   LinkBmsDeviceToBimDevices(bmsContextId, bmsDeviceId, bimDeviceId) {
      const promises = [this.getEndpointsMap(bmsContextId, bmsDeviceId), this._getAutomateItems(bimDeviceId), this._getBacnetProfil(bimDeviceId)]

      return Promise.all(promises).then(([bmsDevicesMap, bimDevicesMap, bacnetProfilId]) => {
         const prom2 = []
         bimDevicesMap.forEach((value, key) => {
            const bmsElement = bmsDevicesMap.get(key)
            if (bmsElement) {
               console.log("link item to device")
               prom2.push(SpinalGraphService.addChild(bmsDeviceId, bacnetProfilId, "hasBacnetProfile", SPINAL_RELATION_PTR_LST_TYPE));
               prom2.push(SpinalGraphService.addChild(value.parentId, bmsElement.nodeId, SpinalBmsEndpoint.relationName, SPINAL_RELATION_PTR_LST_TYPE));
               prom2.push(SpinalGraphService.addChild(value.nodeId, bmsElement.nodeId, SpinalBmsEndpoint.relationName, SPINAL_RELATION_PTR_LST_TYPE));
               prom2.push(SpinalGraphService.addChild(bmsElement.nodeId, value.nodeId, "hasBmsProfil", SPINAL_RELATION_PTR_LST_TYPE));
            }
         })

         return Promise.all(prom2);
      })
   },

   getEndpointsMap(bmsContextId, bmsDeviceId) {

      return SpinalGraphService.findInContext(bmsDeviceId, bmsContextId, (node) => {
         if (node.getType().get() === SpinalBmsEndpoint.nodeTypeName) {
            SpinalGraphService._addNode(node)
            return true;
         }
         return false;
      }).then((nodes) => {
         const bmsDeviceMap = new Map();

         const promises = nodes.map(async el => {
            const realNode = SpinalGraphService.getRealNode(el.id.get());
            const element = await realNode.getElement();
            const _temp = element.get()
            _temp.nodeId = el.id.get();
            bmsDeviceMap.set(_temp.id, _temp);
            return _temp;
         })

         return Promise.all(promises).then(() => {
            return bmsDeviceMap;
         })
      })
   },

   // getProfilMap(deviceId) {

   //    return this._getAutomateItems(deviceId).then((devices) => {
   //       // const promises = devices.map(device => {

   //       // })
   //    })
   // },

   _getAutomateItems(automateId) {
      // return SpinalGraphService.getChildren(automateId, [spinalNetworkTreeService.constants.NETWORK_BIMOJECT_RELATION]).then((bimObjects) => {
      //    return bimObjects.map(el => el.get());
      // })

      const bimDeviceMap = new Map();

      return linkAutomateToProfilUtilities.getDeviceAndProfilData(automateId).then((result) => {
         const promises = result.valids.map(async ({ automateItem, profileItem }) => {
            const attrs = await this.getItemIO(profileItem.id);
            for (const attr of attrs) {
               attr.parentId = automateItem.id;
               bimDeviceMap.set(parseInt(attr.IDX), attr);
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

   _getBacnetProfil(bimDeviceId) {
      return SpinalGraphService.getChildren(bimDeviceId, ["hasBacnetProfile"]).then((children) => {
         if (children.length > 0) return children[0].id.get()
      })
   }

}