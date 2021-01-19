<!--
Copyright 2020 SpinalCom - www.spinalcom.com
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
  <div class="_container">
    <div class="content"
         v-if="isLoaded">
      <div class="md-layout md-gutter">
        <div class="md-layout-item md-size-33">
          <md-field>
            <label>Attribute name</label>
            <md-input v-model="attribute.attributeName"></md-input>
          </md-field>
        </div>

        <div class="md-layout-item md-size-33">
          <md-field>
            <label>Separator</label>
            <md-input v-model="attribute.separator"></md-input>
          </md-field>
        </div>

        <div class="md-layout-item md-size-33">
          <md-field>
            <label>index</label>
            <md-input v-model="attribute.indice"
                      type="number"></md-input>
          </md-field>
        </div>
      </div>
    </div>
    <div class="loading"
         v-else>
      loading...
    </div>
  </div>
</template>

<script>
export default {
  name: "configuration",
  props: {
    data: {},
    attribute: {},
  },
  data() {
    return {
      isLoaded: true,
    };
  },
  methods: {
    refresh() {
      this.isLoaded = false;
      setTimeout(() => {
        this.isLoaded = true;
      }, 300);
    },
    // goToNext() {
    //   this.$emit("next", { id: "first", index: "second" });
    // }
  },
};
</script>

<style scoped>
._container {
  width: 100%;
  height: 100%;
  padding: 0 0 0 0;
}
._container .content {
  width: 100%;
  height: 100%;
}
/* .container .buttons {
  width: 100%;
  height: 10%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
} */
</style>