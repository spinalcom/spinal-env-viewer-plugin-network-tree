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
	<div class="content">
		<div class="buttons" v-if="appState === STATES.normal">
			<md-button v-if="!verified" :disabled="disableVerificationButton" class="md-raised md-primary"
				@click="launchVerification">
				Verify
			</md-button>

			<div class="content-items" v-else-if="verified">
				<div class="content-item">
					<md-button class="resultVerification md-dense md-primary" @click="selectItems(validItems)">
						Valid item(s) :
						{{ validItems.length }}
					</md-button>

					<md-button class="resultVerification md-dense md-accent" @click="selectItems(invalidItems)">
						invalid item(s) :
						{{ invalidItems.length }}
					</md-button>
				</div>

				<div class="content-item classifyContent">
					<div class="checkbox">
						<md-checkbox v-model="classify.class" class="md-primary">Classify controllers By</md-checkbox>
					</div>

					<div class="input">
						<md-field>
							<label>Attribute name</label>
							<md-input :disabled="!classify.class" v-model="classify.by"></md-input>
						</md-field>
					</div>
				</div>

				<div class="content-item">
					<md-checkbox v-model="dontCreateEmptyAutomate" class="md-primary">Don't create Controllers which do
						not control
						equipment</md-checkbox>
				</div>

				<div class="content-item">
					<md-button :disabled="error" class="md-raised md-primary" @click="launchGeneration">Launch
						Generation</md-button>

					<!--  
               <md-button
                  :disabled="error"
                  class="md-raised md-primary"
               >Edit Links</md-button>-->
				</div>
			</div>
		</div>

		<div class="state" v-else-if="appState === STATES.loading">
			<md-progress-spinner md-mode="indeterminate"></md-progress-spinner>
		</div>

		<div class="progress-bar" v-else-if="appState === STATES.creation">
			<div class="percent-number">{{ percent }} %</div>
			<!-- md-mode="determinate" -->
			<md-progress-bar class="percent-bar" md-mode="buffer" :md-value="percent"></md-progress-bar>
		</div>

		<div class="state" v-else-if="appState === STATES.success">
			<md-icon class="md-size-4x">check</md-icon>
		</div>

		<div class="state" v-else-if="appState === STATES.error">
			<md-icon class="md-size-4x">close</md-icon>
		</div>
	</div>
</template>

<script>
import { SpinalGraph, SpinalGraphService, SPINAL_RELATION_PTR_LST_TYPE } from "spinal-env-viewer-graph-service";
// // import { SpinalGraphService } from "spinal-env-viewer-graph-service";
// import generateAutomateService from "../../../js/generateAutomateService";
// import spinalNetworkTreeService from "../../../services/index";

import {
	NetworkTreeService,
	GenerateNetworkTreeService,
	AttributesUtilities,
	CONSTANTS,
} from "spinal-env-viewer-plugin-network-tree-service";

export default {
	name: "launchGeneration",
	props: {
		automatesObj: {},
		equipmentsObj: {},
		attribute: {},
		error: {},
		contextId: {},
		selectedNodeId: {},
		changed: {},
		namingConvention: {},
	},
	data() {
		this.STATES = {
			loading: 1,
			normal: 2,
			creation: 3,
			success: 4,
			error: 5,
		};
		// this.automatesVerificationResult = {};
		// this.equipementsVerificationResult = {};

		this.tree = [];
		this.floorsInGraph = null;

		return {
			percent: 0,
			verified: false,
			valueGrouped: null,
			appState: this.STATES.normal,
			validItems: [],
			invalidItems: [],
			dontCreateEmptyAutomate: true,
			classify: {
				class: true,
				by: "Niveau",
			},
		};
	},
	methods: {
		async launchVerification() {
			this.appState = this.STATES.loading;
			this.formatData().then(
				({ automatesProperties, equipementsProperties }) => {
					return GenerateNetworkTreeService.createTree(
						automatesProperties,
						equipementsProperties,
						this.attribute
					).then(({ tree, invalids, valids }) => {
						this.tree = tree;
						this.validItems = valids;
						this.invalidItems = invalids;

						this.verified = true;
						this.appState = this.STATES.normal;
						this.$emit("verified");
					});

					// this.automatesVerificationResult = result.automatesProperties;
					// this.equipementsVerificationResult = result.equipementsProperties;
					//    this.verified = true;
					//    this.appState = this.STATES.normal;
					//    this.$emit("verified");
				}
			);
		},

		async launchGeneration() {
			this.appState = this.STATES.creation;
			let tree = [...this.tree];

			// if (this.dontCreateEmptyAutomate) {
			// 	tree = this.tree.filter((el) => el.children.length > 0);
			// }

			const Listelength = tree.length;
			let isError = false;

			while (!isError && tree.length > 0) {
				const item = tree.shift();

				// skip if the item is empty and dontCreateEmptyAutomate is true
				if (this.dontCreateEmptyAutomate && item.children.length === 0) continue;

				try {
					if (item) {
						const parentId = await this.getOrCreateParentId(this.contextId, this.selectedNodeId, item);
						await GenerateNetworkTreeService._createNodes(this.contextId, item, parentId);

						if (this.isClassifyByLevel()) await this.linkToFloor(parentId);

						// this.percent = Math.floor((100 * (Listelength - tree.length)) / Listelength);
					}
				} catch (error) {
					console.error(error);
					isError = true;
				}
			}

			if (isError) {
				this.appState = this.STATES.error;
				return;
			}

			this.appState = this.STATES.success;
		},

		isClassifyByLevel() {
			return this.classify.class && this.classify.by && this.classify.by.trim().length > 0;
			// const possibleAttributes = ["niveau", "level", "floor", "etage"];
			// return this.classify.class && possibleAttributes.includes(this.classify.by.toLowerCase());
		},

		async linkToFloor(automateGroupId) {
			if (this.floorsInGraph == null) this.floorsInGraph = await this.getFloorsInGraph();
			const automateGroupInfo = SpinalGraphService.getInfo(automateGroupId);

			const floorFound = this.floorsInGraph[automateGroupInfo.name.get()];
			if (floorFound) {
				SpinalGraphService._addNode(floorFound);
				const floorId = floorFound.getId().get();

				await SpinalGraphService.addChild(floorId, automateGroupId, "hasNetworkTree", SPINAL_RELATION_PTR_LST_TYPE)
					.catch((error) => {
						console.error("Error linking automate group to floor:", error);
					});
			}
		},


		async getFloorsInGraph() {
			const contexts = await SpinalGraphService.getContextWithType("geographicContext");
			let context = contexts.find((el) => el.getName().get().toLowerCase() === "spatial");

			if (!context) return {};

			const building = (await context.getChildren("hasGeographicBuilding"))[0];
			if (!building) return {};

			const floors = await building.getChildren("hasGeographicFloor");
			if (!floors || floors.length === 0) return {};

			return floors.reduce((acc, floor) => {
				const name = floor.getName().get();
				acc[name] = floor;
				return acc;
			}, {});
		},

		async getOrCreateParentId(contextId, nodeId, item) {
			if (!this.classify.class) {
				return nodeId;
			}

			const val = this.classify.by;

			// const found = item.properties.find(
			//    (el) => el.attributeName == val || el.displayName == val
			// );
			const found = await AttributesUtilities.findAttribute(item.model, item.dbId, val);

			const parentName = found && found.displayValue ? found.displayValue : "Others";

			const children = await SpinalGraphService.getChildren(nodeId, [
				// spinalNetworkTreeService.constants.NETWORK_RELATION,
				CONSTANTS.NETWORK_RELATION,
			]);

			const parentFound = children.find((el) => el.name.get() == parentName);

			if (parentFound) return parentFound.id.get();


			const parent = await NetworkTreeService.addNetwork(parentName, nodeId, contextId);

			SpinalGraphService._addNode(parent);
			return parent.getId().get();
		},

		_displayResult(result) {
			this.appState = result;
			setTimeout(() => {
				this.appState = this.STATES.normal;
			}, 1000);
		},

		formatData() {
			const promises = [
				GenerateNetworkTreeService.getElementProperties(
					this.automatesObj.items,
					this.automatesObj.attributeName,
					this.namingConvention
				),
				GenerateNetworkTreeService.getElementProperties(
					this.equipmentsObj.items,
					this.equipmentsObj.attributeName,
					this.namingConvention
				),
			];

			return Promise.all(promises).then((result) => {
				return {
					automatesProperties: result[0] && result[0].validItems,
					equipementsProperties: result[1] && result[1].validItems,
				};
			});
		},

		selectItems(argItems) {
			const items =
				GenerateNetworkTreeService.classifyDbIdsByModel(argItems);
			window.spinal.ForgeViewer.viewer.impl.selector.setAggregateSelection(
				items
			);
		},
	},
	computed: {
		disableVerificationButton() {
			return (
				(this.automatesObj.items.length === 0 &&
					this.automatesObj.attributeName.trim().length === 0) ||
				(this.equipmentsObj.items.length === 0 &&
					this.equipmentsObj.attributeName.trim().length === 0)
			);
		},
	},
	watch: {
		changed() {
			if (this.changed) {
				this.appState = this.STATES.normal;
				this.verified = false;
			}
		},
		// attribute() {
		//   this.verified = false;
		// }
	},
};
</script>

<style scoped>
.content {
	width: 100%;
	height: 100%;
}

.content .buttons {
	width: 100%;
	display: flex;
	justify-content: center;
}

.content .buttons .content-items {
	width: 100%;
	height: 100%;
}

.content .buttons .content-items .content-item {
	width: 100%;
	height: 50px;
	margin-bottom: 5px;
}

.content .buttons .content-items .content-item.classifyContent {
	display: flex;
	align-items: center;
}

/* .content
   .buttons
   .content-items
   .content-item.content-item.classifyContent
   .checkbox {
}

.content
   .buttons
   .content-items
   .content-item.content-item.classifyContent
   .input {
} */

.state {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}

.progress-bar {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.progress-bar .percent-number {
	font-size: 1.8em;
	margin: 10px 0;
}

.progress-bar .percent-bar {
	width: 90%;
}
</style>
