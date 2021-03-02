import Vue from "vue";
const { SpinalMountExtention } = require("spinal-env-viewer-panel-manager-service");



import dialogComponent from "./network_dialogs/dialog.vue";
import linkAutomateToProfil from './link_to_virtual_profil/linkAutomateToProfil.vue';
// import linkDevicesDialog from "./linkDevices.vue";
import confirmUnlikProfilDialog from "./link_to_virtual_profil/confirmUnlikProfil.vue";
import editAutomateLinkDialog from './link_to_virtual_profil/editLinksDialog.vue'
import PersonalizedAttributeDialog from "./network_dialogs/personalizedAttributeDialog.vue"
import PersonalizeNamingConvention from "./network_dialogs/personalizeNamingConvention.vue";

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
},
{
    name: "personalizeNamingConvention",
    vueMountComponent: Vue.extend(PersonalizeNamingConvention),
    parentContainer: document.body
}
]


for (let index = 0; index < dialogs.length; index++) {
    SpinalMountExtention.mount(dialogs[index]);
}