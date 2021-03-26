import { SpinalGraphService } from "spinal-env-viewer-graph-service"
import { SpinalBmsNetwork, SpinalBmsDevice } from "spinal-model-bmsnetwork";

const CONTEXT_TYPE = 'Network';


export default {

   getDeviceContextTreeStructure() {
      const contexts = this.getContexts().map(el => el.info.get());
      const promises = contexts.map(async context => {
         const networks = await this.getNetwork(context.id);

         const promises2 = networks.map(async network => {
            const devices = await this.getDevices(network.id);
            network.devices = devices;
            return network;
         })

         context.networks = await Promise.all(promises2);
         return context;
      })

      return Promise.all(promises);
   },

   getContexts() {
      return SpinalGraphService.getContextWithType(CONTEXT_TYPE);
   },

   getNetwork(contextId) {
      return SpinalGraphService.getChildren(contextId, SpinalBmsNetwork.relationName).then((result) => {
         return result.map(el => el.get())
      })
   },

   getDevices(networkId) {
      return SpinalGraphService.getChildren(networkId, SpinalBmsDevice.relationName).then((result) => {
         return result.map(el => el.get())
      })
   }


}