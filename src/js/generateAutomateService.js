import { bimObjectManagerService } from "spinal-env-viewer-bim-manager-service";
import { SpinalGraphService, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service";
import spinalNetworkTreeService from '../services/index'

// import Sandbox from "v8-sandbox";

import vm from 'vm';

import { DEVICE_RELATION_NAME, PART_RELATION_NAME } from "spinal-env-viewer-plugin-device_profile/constants";

import { NETWORK_BIMOJECT_RELATION } from "../services/constants";

import _ from 'lodash';
import { OBJECT_ATTR, PLC_ATTR } from "./attributeConfig";

export default {

   async getElementProperties(items, attributeName) {
      const res = {
         validItems: [],
         invalidItems: []
      }

      const data = await bimObjectManagerService.getBimObjectProperties(items);
      const dataFormated = data.map((item) => {
         return item.properties.map((el) => {
            el.model = item.model;
            el.property = this._getAttributeByName(el.properties, attributeName);

            if (el.property) {
               res.validItems.push(el);
            } else {
               res.invalidItems.push(el);
            }
            return el;
         });
      });

      return res;
   },

   async createTree(automates, equipments, config) {
      return this._getTreeArray(automates, equipments, config).then(async ({ tree, valids, invalids }) => {
         const treeL = await this._TransformArrayToTree(tree);
         return {
            tree: treeL,
            invalids,
            valids
         }

      })

      // const promises = tree.map(el => this._createNodes(contextId, el, nodeId));

      // return Promise.all(promises);

   },

   createTreeNodes(contextId, nodeId, tree, dontCreateEmptyAutomate = true) {
      if (dontCreateEmptyAutomate) {
         tree = tree.filter(el => el.children.length > 0);
      }
      const promises = tree.map(el => this._createNodes(contextId, el, nodeId));
      return Promise.all(promises);

   },

   /////////////////////////////////////////////////////////////////////////////////////////////////////
   //                          PRIVATES            
   /////////////////////////////////////////////////////////////////////////////////////////////////////
   _getBimObjectName({ dbId, model }) {
      return new Promise((resolve, reject) => {
         model.getBulkProperties([dbId], {
            propFilter: ['name']
         }, (el) => {
            resolve(el);
         })
      });
   },

   _getAttributeByName(properties, propertyName) {
      return properties.find((obj) => {
         return (obj.displayName === propertyName || obj.attributeName === propertyName) && (obj.displayValue && (obj.displayValue + '').length > 0)

      });
   },

   async _getTreeArray(items, equipments, config) {

      const tree = await this._formatAutomateAttribute(items);
      const invalids = [];
      const valids = [];
      const subList = _.chunk(equipments, 100);

      const promises = subList.map(el => {
         return this._formatEquipmentAttribute(tree, el, config)
      })

      return Promise.all(_.flattenDeep(promises)).then((result) => {
         for (const ite of result) {
            if (ite.parentId !== "noParent") {
               tree.push(ite);
               valids.push(ite);
            } else {
               invalids.push(ite);
            }
         }

         return {
            tree: tree,
            valids: valids,
            invalids: invalids
         }
      })

      // return subList.map(el => {
      //    return () => {
      //       return this._formatEquipmentAttribute(tree, el, config).then((res) => {
      //          tree.push(...res.linked);
      //          invalids.push(...res.notLinked);
      //       })
      //    }
      // }).reduce((previous, current) => { return previous.then(current) }, Promise.resolve()).then(() => {
      //    return { valids: tree, invalids: invalids }
      // })
   },

   _formatAutomateAttribute(items) {
      const promises = items.map(el => {
         return this._getBimObjectName(el).then((result) => {
            el.id = result[0].dbId;
            el.name = result[0].name;
            // const attributes = el.property.displayValue.split(separator);
            // const len = attributes.length
            // el.namingConvention = `${attributes[len - 2]}${separator}${attributes[len - 1]}`;
            // el.namingConvention = el.property.displayValue.split(separator).splice(indice).join(separator);
            // el.property = el.property.displayValue.split(separator, indice).join(separator);
            el.property = el.property.displayValue;
            el.color = this._generateRandomColor();
            return el;
         })
      })

      return Promise.all(promises);
   },

   _formatEquipmentAttribute(tree, equipments, config) {

      const promises = [];

      for (const element of equipments) {
         promises.push(this._formatItem(tree, element, config));

         // const attributes = element.property.displayValue.split(separator);
         // const len = attributes.length;

         // const attr = element.property.displayValue.split(separator, indice).join(separator)
         // const attr = element.property.displayValue;

         // const parent = this.getElementAut(tree, element, config);

      }

      return promises;

   },

   async _formatItem(tree, element, config) {
      const obj = {
         model: element.model,
         dbId: element.dbId,
         externalId: element.externalId,
         id: element.dbId,
         children: [],
         parentId: "noParent"
      }

      let parent = this.getElementAut(tree, element, config);

      if (parent && parent.dbId !== obj.dbId) {
         // console.log("parent found", parent.name);
         obj.parentId = parent.id;
      }

      return obj;
   },

   async _createBimObjectNode({ dbId, model, color }) {
      const elements = await this._getBimObjectName({ dbId, model })
      const element = elements[0];
      return window.spinal.BimObjectService.createBIMObject(element.dbId, element.name, model).then((node) => {
         const nodeId = node.id ? node.id.get() : node.info.id.get();
         const realNode = SpinalGraphService.getRealNode(nodeId);

         // if (realNode.info.namingConvention) {
         //    realNode.info.namingConvention.set(namingConvention)
         // } else {
         //    realNode.info.add_attr({ namingConvention: namingConvention })
         // }

         if (realNode.info.color) {
            realNode.info.color.set(color);
         } else {
            realNode.info.add_attr({ color: color });
         }

         return nodeId;
      })
   },

   async _createNodes(contextId, tree, parentId) {
      let id;
      let relationName;

      if (tree.externalId && tree.dbId) {
         id = await this._createBimObjectNode(tree);
         relationName = spinalNetworkTreeService.constants.NETWORK_BIMOJECT_RELATION
      } else {
         id = SpinalGraphService.createNode({ name: tree.name, type: spinalNetworkTreeService.constants.NETWORK_TYPE }, new Model());
         relationName = spinalNetworkTreeService.constants.NETWORK_RELATION
      }

      await SpinalGraphService.addChildInContext(parentId, id, contextId, relationName, SPINAL_RELATION_PTR_LST_TYPE);

      if (tree.children && tree.children.length > 0) {
         return Promise.all(tree.children.map(el => this._createNodes(contextId, el, id)))
      }

      return []

   },

   _TransformArrayToTree(items) {

      const rootItems = [];

      const lookup = {};

      for (const item of items) {

         const itemId = item["id"];
         const parentId = item["parentId"];

         if (!lookup[itemId]) lookup[itemId] = { ["children"]: [] }

         lookup[itemId] = Object.assign({}, item, { ["children"]: lookup[itemId]["children"] })

         const TreeItem = lookup[itemId];

         if (parentId === null || parentId === undefined || parentId === "") {

            rootItems.push(TreeItem);
         }

         else {
            if (!lookup[parentId]) lookup[parentId] = { ["children"]: [] };
            lookup[parentId]["children"].push(TreeItem);
         }
      }

      return rootItems
   },

   _generateRandomColor() {
      const randomColor = Math.floor(Math.random() * 16777215).toString(16);
      return '#' + randomColor;
   },

   getElementAut(tree, item, config) {
      const elementAttribute = item.property.displayValue;

      if (config.isRegex) {
         // let string = `${config.select + ""}.match(/${config.text + ""}/${config.flags.join('')})`;
         // string = string.replace(OBJECT_ATTR, elementAttribute);

         const flags = config.flags.join('');


         return eval(`tree.find(element => {
            const select = config.select.replace('${OBJECT_ATTR}', elementAttribute).replace('${PLC_ATTR}', element.property);
            const text = config.text.replace('${OBJECT_ATTR}', elementAttribute).replace('${PLC_ATTR}', element.property);
            const regex = new RegExp(text,flags)
            const res = (select + "").match(regex);
            
            return res ? true : false;
         })`)

         // return eval(`tree.find(element => {
         //    const x = string.replace('${PLC_ATTR}', element.property);
         //    console.log(x);
         //    console.log("res", res);
         //    return res ? true : false;
         // })`)

      } else {

         // const iteratable = _createIteratable(tree, item.property.displayValue, config.callback);
         // let processing = true;
         // let parent;

         // while (processing) {

         //    const next = iteratable.next();
         //    if (next.value) parent = next.value;
         //    console.log("next", next);
         //    if (typeof parent !== "undefined" || next.done) {
         //       processing = false;
         //    }
         // }

         // const obj = { res: false };
         // const context = vm.createContext(obj);

         // for (const element of tree) {
         //    const code = `res = (${config.callback})('${element.property}', '${item.property.displayValue}')`;
         //    vm.runInContext(code, context);
         //    if (context.res) return element;
         // }

         // const obj = { res: false };
         // const context = vm.createContext(obj);
         // const code = `res = (${config.callback})('${element.property}', '${item.property.displayValue}')`;
         // vm.runInContext(code, context);
         // return context.res;


         return eval(
            `tree.find(element => {
               return (${config.callback})(element.property, elementAttribute); 
            })`
         )
      }
   },

}