import {
  SpinalContextApp
} from "spinal-env-viewer-context-menu-service";

import ContextGeographicService from "spinal-env-viewer-context-geographic-service";

import networkTreeService from "../services";


class AddBimObjects extends SpinalContextApp {
  constructor() {
    super(
      "add BimObject",
      "This button adds all elements selected", {
        icon: "post_add",
        icon_type: "in",
        backgroundColor: "#FF0000",
        fontColor: "#FFFFFF"
      }
    );
  }

  isShown(option) {
    let typeSelected = option.context.type.get();

    let display = networkTreeService.constants.CONTEXT_TYPE === typeSelected;

    return Promise.resolve(display ? true : -1);

  }

  action(option) {
    const viewer = window.spinal.ForgeViewer.viewer;
    var bimSelected = viewer.getAggregateSelection();

    if (bimSelected.length === 0) {
      alert("select an object");
      return;
    }

    networkTreeService.addBimObject(option.context.id.get(), option
      .selectedNode.id.get(), bimSelected);


    // for (let idx = 0; idx < bimSelected.length; idx++) {
    //   const {
    //     model,
    //     selection
    //   } = bimSelected[idx];


    //   model.getBulkProperties(selection, {
    //     propFilter: ['name']
    //   }, (el) => {

    //     el.forEach(element => {
    //       ContextGeographicService.addBimElement(
    //         option.context,
    //         option.selectedNode,
    //         element,
    //         model
    //       );
    //     });
    //   });
    // }

  }

}


export default AddBimObjects;