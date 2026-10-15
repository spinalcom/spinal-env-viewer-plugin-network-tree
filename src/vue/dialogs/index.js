import Vue from "vue";
const { SpinalMountExtention } = require("spinal-env-viewer-panel-manager-service");
import {
    CREATE_NETWORK_DIALOG,
    LINK_AUTOMATE_TO_PROFIL_DIALOG,
    CONFIRM_UNLIK_PROFIL_DIALOG,
    EDIT_AUTOMATE_LINK_DIALOG,
    PERSONALIZED_ATTRIBUTE_DIALOG,
    PERSONALIZE_NAMING_CONVENTION,
    LINK_TO_GTB_DIALOG,
    EDIT_LINK_TO_GTB_DEVICE
} from "../../js/constants";



import dialogComponent from "./network_dialogs/dialog.vue";
import linkAutomateToProfil from './link_to_virtual_profil/linkAutomateToProfil.vue';
// import linkDevicesDialog from "./linkDevices.vue";
import confirmUnlikProfilDialog from "./link_to_virtual_profil/confirmUnlikProfil.vue";
import editAutomateLinkDialog from './link_to_virtual_profil/editLinksDialog.vue'
import PersonalizedAttributeDialog from "./network_dialogs/personalizedAttributeDialog.vue"
import PersonalizeNamingConvention from "./network_dialogs/personalizeNamingConvention.vue";

import LinkToGtbDialog from "./link_to_gtb/linkToGtbDialog.vue";
import EditLinkToGTBDevice from "./link_to_gtb/confirmLinkToGTB.vue"

const dialogs = [
    {
        name: CREATE_NETWORK_DIALOG,
        vueMountComponent: Vue.extend(dialogComponent),
        parentContainer: document.body
    },
    {
        name: LINK_AUTOMATE_TO_PROFIL_DIALOG,
        vueMountComponent: Vue.extend(linkAutomateToProfil),
        parentContainer: document.body
    },
    {
        name: CONFIRM_UNLIK_PROFIL_DIALOG,
        vueMountComponent: Vue.extend(confirmUnlikProfilDialog),
        parentContainer: document.body
    }, {
        name: EDIT_AUTOMATE_LINK_DIALOG,
        vueMountComponent: Vue.extend(editAutomateLinkDialog),
        parentContainer: document.body
    },
    {
        name: PERSONALIZED_ATTRIBUTE_DIALOG,
        vueMountComponent: Vue.extend(PersonalizedAttributeDialog),
        parentContainer: document.body
    },
    {
        name: PERSONALIZE_NAMING_CONVENTION,
        vueMountComponent: Vue.extend(PersonalizeNamingConvention),
        parentContainer: document.body
    },
    {
        name: LINK_TO_GTB_DIALOG,
        vueMountComponent: Vue.extend(LinkToGtbDialog),
        parentContainer: document.body
    },
    {
        name: EDIT_LINK_TO_GTB_DEVICE,
        vueMountComponent: Vue.extend(EditLinkToGTBDevice),
        parentContainer: document.body
    }
]


for (let index = 0; index < dialogs.length; index++) {
    SpinalMountExtention.mount(dialogs[index]);
}