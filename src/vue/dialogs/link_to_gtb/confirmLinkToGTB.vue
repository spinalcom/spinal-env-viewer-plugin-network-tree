<!--
Copyright 2021 SpinalCom - www.spinalcom.com

This file is part of SpinalCore.

Please read all of the following terms and conditions
of the Free Software license Agreement ("Agreement")
carefully.

This Agreement is a legally binding contract between
the Licensee (as defined below) and SpinalCom that
sets forth the terms and conditions that govern your
use of the Program. By installing and/or using the
Program, you agree to abide by all the terms and
conditions stated or referenced herein.

If you do not agree to abide by these terms and
conditions, do not demonstrate your acceptance and do
not install or use the Program.
You should have received a copy of the license along
with this file. If not, see
<http://resources.spinalcom.com/licenses.pdf>.
-->

<template>
   <div class="linkerDialogsContent">

      <!-- <div class="content"> -->
      <edit-link
         :data="data"
         :rightTitle="'BMS devices'"
         :leftTitle="'BIM devices'"
      ></edit-link>
      <!-- </div> -->

   </div>
</template>

<script>
import editLinkContent from "../../components/links/editLinks.vue";

export default {
   name: "editLinkToGTBDevice",
   props: { data: {} },
   components: {
      "edit-link": editLinkContent,
   },
   data() {
      return {};
   },
   mounted() {
      // console.log("mounted");
      // this.data = this._getResult(option.bmsDevices, option.bimDevices);
   },
   methods: {
      // opened(option) {},
      // removed(option) {
      //    this.showDialog = false;
      // },
      // closeDialog(closeResult) {
      //    if (typeof this.onFinised === "function") {
      //       this.onFinised(closeResult);
      //    }
      // },
   },
};
</script>

<style scoped>
.linkerDialogsContent {
   width: 100%;
   height: 100%;
}

/* .linkerDialogsContent .content {
   width: 100%;
   height: 100%;
} */
</style>