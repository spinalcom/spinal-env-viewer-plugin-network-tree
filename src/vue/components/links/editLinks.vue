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
  <div class="link_container"
       v-if="data">
    <div class="links md-scrollbar">
      <div class="title">Items Linked</div>
      <div class="content">
        <div class="linkedTemplate"
             v-for="(item,index) of data.valids"
             :key="index">
          <div class="itemsLinked"
               v-tooltip="item.automateItem.name">
            <span>{{item.automateItem.name}}</span>
          </div>
          <div class="unlinkButton">
            <md-button class="md-icon-button md-raised unlink"
                       @click="unLinkItems(item.automateItem.id,item.profileItem.id)"
                       v-tooltip="'unlink'">
              <md-icon>link_off</md-icon>
            </md-button>
          </div>
          <div class="itemsLinked"
               v-tooltip="item.profileItem.name">
            <span>{{item.profileItem.name}}</span>
          </div>
        </div>
      </div>

    </div>
    <!-- 
  ////////////////////////////////////////////////////////////
  //                    Items
  ////////////////////////////////////////////////////////////
 -->
    <div class="items">
      <div class="physical_automates">
        <div class="title">{{leftTitle}}</div>
        <div class="lists">
          <div class="list"
               v-if="data.invalidAutomateItems.length > 0">
            <div class="listItem"
                 v-for="automateItem of data.invalidAutomateItems"
                 :key="automateItem.id"
                 v-tooltip="automateItem.name">
              <!-- <md-checkbox class="md-primary"
                           v-model="automateItem.checked"
                           value="preview" />
              <span class="md-list-item-text">{{automateItem.name}}</span> -->
              <md-radio class="md-primary"
                        v-model="automateItemSelected"
                        :value="automateItem.id">
                {{automateItem.name}}
              </md-radio>
            </div>
          </div>

          <div v-else
               class="allItemsLinked">
            All items are linked
          </div>
        </div>
      </div>

      <div class="linkButton">
        <md-button class="md-icon-button md-raised md-primary"
                   @click="linkItems()"
                   :disabled="disableLink()">
          <md-icon>add_link</md-icon>
        </md-button>
      </div>

      <div class="virtual_automates">
        <div class="title">{{rightTitle}}</div>
        <div class="lists">
          <div class="list"
               v-if="data.invalidProfileItems.length > 0">
            <div class="listItem"
                 v-for="profileItem of data.invalidProfileItems"
                 :key="profileItem.id"
                 v-tooltip="profileItem.name">
              <!-- <md-checkbox class="md-primary"
                           v-model="profileItem.checked"
                           value="preview" />
              <span class="md-list-item-text">{{profileItem.name}}</span> -->
              <md-radio class="md-primary"
                        v-model="profileItemSelected"
                        :value="profileItem.id">
                {{profileItem.name}}
              </md-radio>
            </div>
          </div>

          <div v-else
               class="allItemsLinked">
            All items are linkedAC
          </div>
        </div>

      </div>
    </div>
  </div>

  <div class="loading"
       v-else>
    loading...
  </div>
</template>

<script>
import editListController from "../../../js/controllers/links/editLinksControllers";

export default {
  name: "editLinkComponent",
  props: {
    leftTitle: {},
    rightTitle: {},
    data: {},
  },
  data() {
    return {
      automateItemSelected: undefined,
      profileItemSelected: undefined,
    };
  },
  methods: {
    linkItems() {
      let automateItemList = this.data.invalidAutomateItems;
      let profileItemList = this.data.invalidProfileItems;
      const validList = this.data.valids;

      this.data.valids = editListController.moveItemTovalidList(
        automateItemList,
        profileItemList,
        this.automateItemSelected,
        this.profileItemSelected,
        validList
      );

      this.automateItemSelected = undefined;
      this.profileItemSelected = undefined;

      // let automateItemFound;
      // let profileItemFound;

      // let automateIndice = this.data.invalidAutomateItems.findIndex(
      //   (el) => el.id === this.automateItemSelected
      // );

      // if (automateIndice !== -1)
      //   automateItemFound = this.data.invalidAutomateItems[automateIndice];

      // let profileIndice = this.data.invalidProfileItems.findIndex(
      //   (el) => el.id === this.profileItemSelected
      // );

      // if (profileIndice !== -1)
      //   profileItemFound = this.data.invalidProfileItems[profileIndice];

      // if (automateItemFound && profileItemFound) {
      //   this.data.valids = [
      //     {
      //       automateItem: automateItemFound,
      //       profileItem: profileItemFound,
      //     },
      //     ...this.data.valids,
      //   ];

      //   this.data.invalidProfileItems.splice(automateIndice, 1);
      //   this.data.invalidAutomateItems.splice(profileIndice, 1);

      //   this.automateItemSelected = undefined;
      //   this.profileItemSelected = undefined;
      // }
    },

    unLinkItems(automateItemId, profileItemId) {
      let automateItemList = this.data.invalidAutomateItems;
      let profileItemList = this.data.invalidProfileItems;
      const validList = this.data.valids;

      editListController.removeItemItemFromValidList(
        validList,
        automateItemList,
        profileItemList,
        automateItemId,
        profileItemId
      );

      // let indice = this.data.valids.findIndex(
      //   (item) =>
      //     item.automateItem.id === automateItemId &&
      //     item.profileItem.id === profileItemId
      // );
      // if (indice == -1) return;
      // const found = this.data.valids[indice];
      // if (found) {
      //   this.data.invalidAutomateItems = [
      //     found.automateItem,
      //     ...this.data.invalidAutomateItems,
      //   ];
      //   this.data.invalidProfileItems = [
      //     found.profileItem,
      //     ...this.data.invalidProfileItems,
      //   ];
      //   this.data.valids.splice(indice, 1);
      // }
    },

    disableLink() {
      return (
        typeof this.automateItemSelected === "undefined" ||
        typeof this.profileItemSelected === "undefined"
      );
    },
  },
};
</script>

<style scoped>
.link_container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.link_container .links,
.link_container .items {
  width: 100%;
  height: 49%;
}

.link_container .links {
  border: 1px solid grey;
  overflow-y: auto;
}

.link_container .links .title {
  width: 100%;
  height: 50px;
  /* background: grey; */
  margin: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid grey;
}

.link_container .links .content {
  width: 100%;
  height: calc(100% - 50px);
  overflow: auto;
}

.link_container .links .content .linkedTemplate {
  width: 98%;
  height: 50px;
  display: flex;
  margin: auto;
  background: #686464;
  margin-top: 10px;
  margin-bottom: 5px;

  /* padding: 5px 0; */
}

.link_container .links .content .linkedTemplate .itemsLinked {
  width: calc(50% - 30px);
  height: 100%;
  display: flex;
  /* justify-content: center; */
  align-items: center;
  text-align: center;
}

.link_container .links .content .linkedTemplate .itemsLinked span {
  max-width: 95%;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 10px;
}

.link_container .links .content .linkedTemplate .unlinkButton {
  width: 50px;
  height: 100%;

  /* border: 1px solid grey; */
}

.link_container .links .content .linkedTemplate .unlinkButton .unlink {
  width: 100%;
  height: 100%;
  margin: 0px;
  box-shadow: unset;
  /* border-right: 2px solid white;
  border-left: 2px solid white; */
}

.link_container .items {
  display: flex;
  /* justify-content: space-between; */
}

.link_container .items .physical_automates,
.link_container .items .virtual_automates {
  width: calc(50% - 30px);
  height: 100%;
  border: 1px solid grey;
}

.link_container .items .linkButton {
  width: 60px;
  height: 100%;
  display: flex;
  align-items: center;
}

.link_container .items .physical_automates .title,
.link_container .items .virtual_automates .title {
  width: 100%;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid grey;
  /* background: grey; */
}

.link_container .items .physical_automates .lists,
.link_container .items .virtual_automates .lists {
  width: 100%;
  height: calc(100% - 50px);
  /* overflow-y: auto; */
}

.link_container .items .physical_automates .lists .list,
.link_container .items .virtual_automates .lists .list {
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.link_container .items .physical_automates .lists .list .listItem,
.link_container .items .virtual_automates .lists .list .listItem {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 400;
  text-align: left;
  padding: 4px 16px;
}

.link_container .items .physical_automates .lists .list .listItem:hover,
.link_container .items .virtual_automates .lists .list .listItem:hover {
  background: grey;
}

.link_container .items .allItemsLinked {
  width: 100%;
  height: calc(100% - 50px);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1.5em;
}
</style>

<style>
.link_container .items .physical_automates .lists .md-radio,
.link_container .items .virtual_automates .lists .md-radio {
  width: 100%;
  padding: 0px;
  margin: 0px;
}

.link_container .items .physical_automates .lists .md-radio .md-radio-label,
.link_container .items .virtual_automates .lists .md-radio .md-radio-label {
  width: calc(100% - 40px);
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>