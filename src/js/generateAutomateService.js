import { bimObjectManagerService } from "spinal-env-viewer-bim-manager-service";
import { SpinalGraphService,SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service";
import spinalNetworkTreeService from '../services/index'

import { DEVICE_RELATION_NAME, PART_RELATION_NAME } from "spinal-env-viewer-plugin-device_profile/constants";

import { NETWORK_BIMOJECT_RELATION } from "../services/constants";



export default {

    async getElementProperties(items,attributeName) {
        const res = {
            validItems : [],
            invalidItems : []
        }
        const data = await bimObjectManagerService.getBimObjectProperties(items);
        const dataFormated = data.map((item) => {
          return item.properties.map((el) => {
            el.model = item.model;
            el.property = this._getAttributeByName(el.properties, attributeName);

            if(el.property) {
                res.validItems.push(el);
            } else {
                res.invalidItems.push(el);
            }
            return el;
          });
        });
  
        return res;
    },

    async createTree(contextId, nodeId, automates, equipments,separator,indice) {
        const treeList = await this._getTreeArray(automates,equipments,separator,indice);
        const tree = await this._TransformArrayToTree(treeList);

        const promises = tree.map(el => this._createNodes(contextId, el, nodeId));

        return Promise.all(promises);

    },

    /////////////////////////////////////////////////////////////////////////////////////////////////////
    //                          PRIVATES            
    /////////////////////////////////////////////////////////////////////////////////////////////////////
    _getBimObjectName({dbId, model}) {
        return new Promise((resolve, reject) => {
            model.getBulkProperties([dbId],{
            propFilter: ['name']
            },(el) => {
                resolve(el);
            })
        });
    },

    _getAttributeByName(properties, propertyName) {
        return properties.find((obj) => {
            return (obj.displayName === propertyName || obj.attributeName === propertyName) && (obj.displayValue && (obj.displayValue + '').length > 0)
            
        });
    },

    async _getTreeArray(items,equipments,separator,indice) {


        const tree = await this._formatAutomateAttribute(items,separator,indice);
        const equipmentTree = this._formatEquipmentAttribute(tree,equipments,separator,indice)

        tree.push(...equipmentTree);


        return tree;
    },

    _formatAutomateAttribute(items,separator,indice) {
        const promises = items.map(el => {
            return this._getBimObjectName(el).then((result) => {
                el.id = result[0].dbId;
                el.name = result[0].name;
                const attributes = el.property.displayValue.split(separator);
                const len = attributes.length
                el.namingConvention = `${attributes[len - 2]}${separator}${attributes[len - 1]}`
                el.property = el.property.displayValue.split(separator,indice).join(separator);
                return el;
            })
        })

        return Promise.all(promises);
    },

    _formatEquipmentAttribute(tree,equipments,separator,indice) {

        return equipments.map((iterator) => {
            const attributes = iterator.property.displayValue.split(separator);
            const len = attributes.length;

            const attr = iterator.property.displayValue.split(separator,indice).join(separator)

            const obj = {
                model : iterator.model, 
                dbId: iterator.dbId, 
                externalId: iterator.externalId,
                id : iterator.dbId,
                children : [],
                namingConvention : `${attributes[len - 2]}${separator}${attributes[len - 1]}`
            }

            const parent = tree.find(element => {
                return element.property === attr
            });
            
            if(parent && parent.dbId !== obj.dbId) {
                obj.parentId = parent.id;
                return obj;
            }
            return;
        }).filter(el => typeof el !== "undefined");

    },

    async _createBimObjectNode({dbId, model, namingConvention}) {
        const elements = await this._getBimObjectName({dbId, model})
        const element = elements[0];
        return window.spinal.BimObjectService.createBIMObject(element.dbId, element.name, model).then((node) => {
            const nodeId = node.id ? node.id.get() : node.info.id.get();
            const realNode = SpinalGraphService.getRealNode(nodeId);
            
            if(realNode.info.namingConvention) {
                realNode.info.namingConvention.set(namingConvention)
            } else {
                realNode.info.add_attr({namingConvention : namingConvention})
            }

            return nodeId;
        })
    },

    async _createNodes(contextId,tree,parentId) {
        let id;
        let relationName;

        if(tree.externalId && tree.dbId) {
            id = await this._createBimObjectNode(tree);
            relationName = spinalNetworkTreeService.constants.NETWORK_BIMOJECT_RELATION
        } else {
            id = SpinalGraphService.createNode({name : tree.name, namingConvention : tree.namingConvention,type : spinalNetworkTreeService.constants.NETWORK_TYPE}, new Model());
            relationName = spinalNetworkTreeService.constants.NETWORK_RELATION
        }

        await SpinalGraphService.addChildInContext(parentId,id,contextId,relationName,SPINAL_RELATION_PTR_LST_TYPE);

        if(tree.children && tree.children.length > 0) {
            return Promise.all(tree.children.map(el => this._createNodes(contextId,el,id)))
        }

        return []

    },

    _TransformArrayToTree(items) {
 
        const rootItems = [];
     
        const lookup = {};
     
        for (const item of items) {
     
            const itemId   = item["id"];
            const parentId = item["parentId"];
     
            if (! lookup[itemId]) lookup[itemId] = { ["children"]: [] }
     
            lookup[itemId] = Object.assign({}, item,{["children"]: lookup[itemId]["children"] })
     
            const TreeItem = lookup[itemId];

            if (parentId === null || parentId === undefined || parentId === "") {
     
                rootItems.push(TreeItem);
            }
     
            else {
                if (! lookup[parentId]) lookup[parentId] = { ["children"]: [] };
                lookup[parentId]["children"].push(TreeItem);
            }
        }
     
        return rootItems
    },

}