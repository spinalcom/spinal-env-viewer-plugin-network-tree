import { SpinalContextApp, spinalContextMenuService } from "spinal-env-viewer-context-menu-service";
import { SpinalGraphService, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service";

import spinalNetworkTreeService from "../../services";

const SIDEBAR = "GraphManagerSideBar";

const automateWatched = new Map();

class SeeSubItems extends SpinalContextApp {
    constructor() {
        super("see sub-items", "See sub-items", {
            icon: "visibility",
            icon_type: "",
            backgroundColor: "#FF0000",
            fontColor: "#FFFFFF"
        })
    }

    isShown(option) {

        const contextType = option.context.type.get();

        if (contextType !== spinalNetworkTreeService.constants.CONTEXT_TYPE) return Promise.resolve(-1);

        const id = option.selectedNode.id.get();
        const realNode = SpinalGraphService.getRealNode(id);

        if (realNode.hasRelation(spinalNetworkTreeService.constants.NETWORK_BIMOJECT_RELATION, SPINAL_RELATION_PTR_LST_TYPE)) {
            this.buttonCfg.icon = typeof automateWatched.get(id) === "undefined" ? "visibility" : "visibility_off";
            return Promise.resolve(true);
        }

        return Promise.resolve(-1);

    }

    async action(option) {
        const { id, color } = option.selectedNode.get();
        const children = await spinalNetworkTreeService.getBimObjectsLinked(id);
        const res = []

        let vector;

        if (typeof automateWatched.get(id) === "undefined") {
            automateWatched.set(id, id);
            this.icon = "visibility_off";
            vector = convertRGBTOVector(color);
        } else {
            automateWatched.delete(id);
            this.icon = "visibility";
            vector = new THREE.Vector4(1, 0, 0, 0);
        }



        children.forEach(el => {
            const model = window.spinal.BimObjectService.getModelByBimfile(el.bimFileId.get());
            if (model) {
                const found = res.find(element => element.model.id === model.id);
                if (found) { found.ids.push(el.dbid.get()) }
                else { res.push({ model: model, ids: [el.dbid.get()] }) }
            }
        });

        res.forEach(({ model, ids }) => {
            ids.forEach(dbId => {
                model.setThemingColor(dbId, vector, true);
            })
        })

        window.spinal.ForgeViewer.viewer.impl.invalidate(true);


    }
}


const convertColorToRGB = (hexColor) => {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } :
        null;
}

const convertRGBTOVector = (hexColor) => {
    const rgbColor = convertColorToRGB(hexColor);
    return rgbColor ?
        // eslint-disable-next-line no-undef
        new THREE.Vector4(
            rgbColor.r / 255,
            rgbColor.g / 255,
            rgbColor.b / 255,
            0.7
        ) :
        // eslint-disable-next-line no-undef
        new THREE.Vector4(1, 0, 0, 0);
}

const seeSubItems = new SeeSubItems();
spinalContextMenuService.registerApp(SIDEBAR, seeSubItems, [3]);

export default seeSubItems;