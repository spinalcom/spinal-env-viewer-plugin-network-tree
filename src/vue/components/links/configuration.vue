<template>
   <div class="_container">
      <div class="subcontent">
         <div class="title">BMS Attribute</div>
         <div class="content">

            <div>
               <md-field>
                  <label for="property">BMS property</label>
                  <md-select
                     v-model="properties.bmsProperty"
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

         </div>
      </div>
      <div class="subcontent">
         <div class="title">BIM Attribute</div>
         <div class="content">
            <div>
               <md-field>
                  <label>BIM Property</label>
                  <md-input v-model="properties.bimProperty"></md-input>
               </md-field>
            </div>
         </div>
      </div>
   </div>
</template>

<script>
import { SpinalBmsDevice } from "spinal-model-bmsnetwork";

export default {
   name: "configurationTemplate",
   props: {
      properties: {},
   },
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
         const device = new SpinalBmsDevice();
         return device._attribute_names.map((element) => ({
            name: element,
            value: element,
         }));
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
   padding: 50px 20px 0 20px;
   height: calc(100% - 50px);
}
</style>