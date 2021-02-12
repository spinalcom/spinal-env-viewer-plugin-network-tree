import Vue from "vue";
const { SpinalMountExtention } = require("spinal-env-viewer-panel-manager-service");



import dialogComponent from "./dialog.vue";
import linkAutomateToProfil from './linkAutomateToProfil.vue';
// import linkDevicesDialog from "./linkDevices.vue";
import confirmUnlikProfilDialog from "./confirmUnlikProfil.vue";
import editAutomateLinkDialog from './editLinksDialog.vue'
import PersonalizedAttributeDialog from "./personalizedAttributeDialog.vue"


const dialogs = [{
    name: "createNetworkDialog",
    vueMountComponent: Vue.extend(dialogComponent),
    parentContainer: document.body
},
{
    name: "linkAutomateToProfilDialog",
    vueMountComponent: Vue.extend(linkAutomateToProfil),
    parentContainer: document.body
},
// {
//     name: "linkDevicesDialog",
//     vueMountComponent: Vue.extend(linkDevicesDialog),
//     parentContainer: document.body
// }, 
{
    name: "confirmUnlikProfilDialog",
    vueMountComponent: Vue.extend(confirmUnlikProfilDialog),
    parentContainer: document.body
}, {
    name: "editAutomateLinkDialog",
    vueMountComponent: Vue.extend(editAutomateLinkDialog),
    parentContainer: document.body
},
{
    name: "personalizedAttributeDialog",
    vueMountComponent: Vue.extend(PersonalizedAttributeDialog),
    parentContainer: document.body
}
]


for (let index = 0; index < dialogs.length; index++) {
    SpinalMountExtention.mount(dialogs[index]);
}