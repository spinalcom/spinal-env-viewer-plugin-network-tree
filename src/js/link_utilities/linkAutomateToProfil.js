
import { SpinalGraphService, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service";
import spinalNetworkTreeService from '../../services/index'
import { serviceDocumentation } from "spinal-env-viewer-plugin-documentation-service";

import devicesProfilService from '../devices_profil_services'
import { ATTRIBUTE_CATEGORY } from "../generateAutomateService";

export default {
   AUTOMATES_TO_PROFILE_RELATION: "hasBacnetProfile",
   OBJECT_TO_BACNET_ITEM_RELATION: "hasBacnetItem",
   DEVICE_PROFILE_CONTEXT: "deviceProfileContext",
   ITEM_LIST_RELATION: "hasItemList",
   ITEM_LIST_TO_ITEMS_RELATION: "hasItem",

   async createMaps(physicalAutomates, virtualAutomates) {

      let map = new Map();

      const promises = physicalAutomates.map(async (el) => {
         return {
            key: el.id,
            values: await this._getFormatedValues(el, virtualAutomates)
         }
      })

      const obj = await Promise.all(promises);
      for (const iterator of obj) {
         map.set(iterator.key, iterator.values);
      }

      return map;
   },

   linkNodes(resultMaps, deviceProfilId) {
      const promises = [];
      resultMaps.forEach((value, key) => {
         promises.push(this.linkProfilToDevice(key, deviceProfilId, value.valids));
      });

      return Promise.all(promises)
   },

   async linkProfilToDevice(automateId, deviceProfilId, itemsValids) {
      const profilLinked = await this.getProfilLinked(automateId);
      if (profilLinked) {
         // if(profilLinked === deviceProfilId) return;
         await this.unLinkDeviceToProfil(automateId, profilLinked);
      }

      return this._createRelationBetweenNodes(automateId, deviceProfilId, itemsValids);
   },

   async linkAutomateItemToProfilItem(automateItemId, profilItemId) {
      const children = await SpinalGraphService.getChildren(automateItemId, [this.OBJECT_TO_BACNET_ITEM_RELATION]);

      if (children.length > 0) {
         const itemLinkedId = children[0].id.get();
         if (itemLinkedId === profilItemId) return;
         await this.unLinkAutomateItemToProfilItem(automateItemId, itemLinkedId);
      }

      return SpinalGraphService.addChild(automateItemId, profilItemId, this.OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
   },

   async getProfilLinked(automateId) {
      const children = await SpinalGraphService.getChildren(automateId, [this.AUTOMATES_TO_PROFILE_RELATION])
      return children.length > 0 ? children[0].id.get() : undefined;
   },

   ////
   // supprimer un profil d'un automate

   async unLinkDeviceToProfil(automateId, argProfilId) {
      let profilId = argProfilId;
      if (typeof profilId === "undefined") {
         profilId = await this.getProfilLinked(automateId);
      }
      const itemsValids = await this._getAutomateItems(automateId);
      const promises = itemsValids.map(async (automateItem) => {
         return this.unLinkAutomateItemToProfilItem(automateItem.id);
      })

      return Promise.all(promises).then((result) => {
         return SpinalGraphService.removeChild(automateId, profilId, this.AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
      })
   },

   async unLinkAutomateItemToProfilItem(automateItemId, profilItemId) {
      if (typeof profilItemId !== "undefined") {
         return SpinalGraphService.removeChild(automateItemId, profilItemId, this.OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)
      }

      const children = await SpinalGraphService.getChildren(automateItemId, [this.OBJECT_TO_BACNET_ITEM_RELATION]);
      return Promise.all(children.map(el => SpinalGraphService.removeChild(automateItemId, el.id.get(), this.OBJECT_TO_BACNET_ITEM_RELATION, SPINAL_RELATION_PTR_LST_TYPE)));
   },

   async getDeviceAndProfilData(automateId) {

      const automateInfo = SpinalGraphService.getInfo(automateId).get();
      const res = { valids: [], invalidAutomateItems: [], invalidProfileItems: [], automate: automateInfo }

      const profilId = await this.getProfilLinked(automateId);
      const automateItems = await this._getAutomateItems(automateId);
      let profilItems = await devicesProfilService.getItemsList(profilId);

      // const promises = automateItems.map(el => SpinalGraphService.getChildren(el.id,[this.OBJECT_TO_BACNET_ITEM_RELATION]));

      return this._waitForEach(automateItems, profilItems, res).then((result) => {
         res.invalidProfileItems = result;
         return res
      })
   },

   ////////////////////////////////////////////////////////////////////////////////////
   //                              private                                           //
   ////////////////////////////////////////////////////////////////////////////////////



   _getFormatedValues(automateInfo, virtualAutomates) {

      // const devicesModels = await (SpinalGraphService.getChildren(automateId,[NETWORK_BIMOJECT_RELATION]))

      return Promise.all([this._getAutomateItems(automateInfo.id), this._formatVirtualAutomates(virtualAutomates)]).then(([devices, items]) => {


         const res = { valids: [], invalidAutomateItems: [], invalidProfileItems: [], automate: automateInfo }

         let remainingItems = JSON.parse(JSON.stringify(items))

         for (const device of devices) {
            let index;
            const found = remainingItems.find((el, i) => {
               if (el.namingConvention && el.namingConvention === device.namingConvention) {
                  index = i;
                  return true;
               }
               return false;
            });

            if (found) {
               remainingItems.splice(index, 1);
               res.valids.push({ automateItem: device, profileItem: found });
            } else {
               res.invalidAutomateItems.push(device)
            }
         }

         res.invalidProfileItems = remainingItems;

         return res;
      })


   },

   _getAutomateItems(automateId) {
      return SpinalGraphService.getChildren(automateId, [spinalNetworkTreeService.constants.NETWORK_BIMOJECT_RELATION]).then((bimObjects) => {
         const promises = bimObjects.map(async el => {
            const temp = el.get()
            temp.namingConvention = await this._getNamingConvention(temp.id, ATTRIBUTE_CATEGORY);
            return temp;
         });

         return Promise.all(promises);
      })
   },

   _formatVirtualAutomates(virtualAutomates) {
      const promises = virtualAutomates.map(async temp => {
         temp.namingConvention = await this._getNamingConvention(temp.id, ATTRIBUTE_CATEGORY);
         return temp;
      })

      return Promise.all(promises);
   },


   async _getNamingConvention(nodeId, categoryName) {
      const realNode = SpinalGraphService.getRealNode(nodeId);
      if (realNode) {
         const attributes = await serviceDocumentation.getAttributesByCategory(realNode, categoryName);

         if (attributes && attributes.length > 0) {
            const attr = attributes.find(el => el.label.get() === "namingConvention");
            if (attr) return attr.value.get();
         }

      }

   },

   _createRelationBetweenNodes(automateId, deviceProfilId, itemsValids) {
      const promises = itemsValids.map(({ automateItem, profileItem }) => {
         return this.linkAutomateItemToProfilItem(automateItem.id, profileItem.id);
      })

      return Promise.all(promises).then((result) => {
         return SpinalGraphService.addChild(automateId, deviceProfilId, this.AUTOMATES_TO_PROFILE_RELATION, SPINAL_RELATION_PTR_LST_TYPE);
      })
   },

   _waitForEach(automateItems, argProfilItems, res) {

      let profilItems = argProfilItems

      const promises = automateItems.map(async (automateItem) => {

         const children = await SpinalGraphService.getChildren(automateItem.id, [this.OBJECT_TO_BACNET_ITEM_RELATION]);
         const child = children[0] && children[0].get();

         if (child) {
            res.valids.push({ automateItem, profileItem: child });

            profilItems = profilItems.filter(el => {

               if (el.id !== child.id) {
                  return true
               }
               return false;
            });

         } else {
            res.invalidAutomateItems.push(automateItem);
         }

         return true;
      })

      return Promise.all(promises).then(() => {
         return profilItems;
      })

   }

}