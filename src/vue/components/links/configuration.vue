<template>
   <div class="_container">
      <div class="subcontent">
         <div class="title">BMS Attribute</div>
         <div class="content">
            <div class="div_select">
               <md-field>
                  <label for="property">BMS property</label>
                  <md-select
                     v-model="bmsData.property"
                     name="Bms Property"
                     id="property"
                     placeholder="Bms Property"
                  >
                     <md-option
                        v-for="property in bmsProperties"
                        :value="property.value"
                        :key="property.value"
                     >{{property.name}}</md-option>
                  </md-select>
               </md-field>
            </div>

            <div class="div_code">
               <div class="checkbox_div">
                  <md-checkbox
                     class="md-primary"
                     v-model="bmsData.useFunction"
                  >Use function to format value</md-checkbox>
               </div>

               <div
                  class="text_editor"
                  v-if="bmsData.useFunction"
               >
                  <spinal-code-mirror
                     class="editorContainer"
                     :codeObj="bmsData.callback"
                  ></spinal-code-mirror>
               </div>
            </div>

         </div>
      </div>
      <div class="subcontent">
         <div class="title">BIM Attribute</div>
         <div class="content">
            <div class="div_select">
               <md-field>
                  <label>BIM Property</label>
                  <md-input v-model="bimData.property"></md-input>
               </md-field>
            </div>

            <div class="div_code">
               <div class="checkbox_div">
                  <md-checkbox
                     class="md-primary"
                     v-model="bimData.useFunction"
                  >Use function to format value</md-checkbox>
               </div>

               <div
                  class="text_editor"
                  v-if="bimData.useFunction"
               >
                  <spinal-code-mirror
                     class="editorContainer"
                     :codeObj="bimData.callback"
                  ></spinal-code-mirror>
               </div>

            </div>

         </div>
      </div>
   </div>
</template>

<script>
import { SpinalBmsDevice } from "spinal-model-bmsnetwork";
import SpinalCodeMirror from "../../components/code-mirror/SpinalCodeMirror.vue";

export default {
   name: "configurationTemplate",
   props: {
      bimData: {},
      bmsData: {},
      properties: {},
   },
   components: { "spinal-code-mirror": SpinalCodeMirror },
   data() {
      return {
         bmsProperties: [],
      };
   },
   mounted() {
      this.bmsProperties = this.getBmsProperties();
   },
   methods: {
      getBmsProperties() {
         // const device = new SpinalBmsDevice();
         // return device._attribute_names.map((element) => ({
         //    name: element,
         //    value: element,
         // }));
         return [
            {
               name: "Device ID",
               value: "id",
            },
            {
               name: "Device Name",
               value: "name",
            },
            {
               name: "IP address",
               value: "address",
            },
            {
               name: "Mac address",
               value: "hostId",
            },
         ];
      },
   },
};
</script>


<style scoped>
._container {
   width: 100%;
   height: 100%;
   display: flex;
   justify-content: space-between;
}

._container .subcontent {
   width: 49%;
   height: 100%;
   border: 1px solid #ffffff;
   border-radius: 5%;
}

._container .subcontent .title {
   width: 100%;
   height: 50px;
   border-bottom: 1px solid white;
   display: flex;
   justify-content: center;
   align-items: center;
}

._container .subcontent .content {
   height: calc(100% - 50px);
   padding: 0 7px;
}

._container .subcontent .content .div_select {
   width: 100%;
   height: 50px;
}

._container .subcontent .content .div_code {
   width: 100%;
   height: calc(100% - 60px);
}

._container .subcontent .content .div_code .checkbox_div {
   width: 100%;
   height: 50px;
}

._container .subcontent .content .div_code .text_editor {
   width: 100%;
   height: calc(100% - 50px);
}
</style>

<style>
._container
   .subcontent
   .content
   .div_code
   .text_editor
   .CodeMirror.cm-s-monokai.CodeMirror-wrap {
   width: 100%;
   height: 98%;
}
</style>