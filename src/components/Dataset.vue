<template>
    <div class="flex-center">
        <div class="middle body">
            <div class="">
                <div class="header">1. Select dataset: {{ dataset && dataset.name }}</div>
                <div class="loading">
                    <div class="loader" v-if="loading"></div>
                </div>
                <div class="items">
                    <div
                        class="btn btn-item"
                        :class="{ active: selectedDataset === set.id }"
                        :key="set.id"
                        @click="selectDataset(set.id)"
                        v-for="set in datasets"
                    >
                        <div>
                            <div class="row v-center">
                                <div class="title-dataset">
                                    {{ `${set.name}` }}
                                </div>
                            </div>
                            <div class="description-small">{{ `Dataset size: ${set.size}` }}</div>
                            <div class="description">
                                {{ set.exists ? set.description : 'Dataset file does not exists' }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div v-if="selectedDataset">
                <div class="header">2. Start new or load saved snapshot</div>
                <div class="row">
                    <div class="btn" @click="handleStartNew" :class="{ active: startNew }">
                        create new
                    </div>
                    <div
                        class="btn"
                        @click="handleLoadSnapshots"
                        :class="{ active: useSnapshots }"
                    >
                        load snapshots
                    </div>
                    <div class="btn" @click="toggleWasmMode" :class="{ active: wasmMode }">
                        wasm
                    </div>
                </div>
            </div>
            <div v-if="startNew" class="">
                <div class="header">3. Select subset or load all images</div>
                <div class="row">
                    <range-slider
                        :change="changeImgCount"
                        :max="maxCount"
                        :min="500"
                        :step="1"
                        :value="imgCount"
                    ></range-slider>
                    <div class="description">{{ `${imgCount}/${maxCount}` }}</div>
                    <!--                        <div class="btn">all</div>-->
                </div>
            </div>
            <div v-if="startNew">
                <div class="header">
                    4. Start a new session
                </div>
                <div class="flex">
                    <div @click="startLoadingNewDataset()" class="btn">start</div>
                </div>
                <div class="description-small">
                    If there is no saved session a new one will be created automatically by clicking
                    "resume"
                </div>
                <!--                    </div>-->
            </div>
            <div v-if="useSnapshots">
                <div class="header">
                    3. Load a saved snapshot
                </div>
                <div class="loading">
                    <div class="loader" v-if="loadingSnapshots"></div>
                </div>
                <div class="items" v-if="!loadingSnapshots">
                    <div class="description-small" v-if="snapshots.length === 0">
                        There are no saved snapshots!
                    </div>
                    <div
                        class="btn btn-item"
                        :key="snap.snapshot_id"
                        @click="selectSnapshot(snap.snapshot_id)"
                        v-for="snap in snapshots"
                    >
                        <div>
                            <div class="row v-center">
                                <div class="title-dataset">
                                    {{ snap.snapshot_name }}
                                </div>
                            </div>
                            <div class="description-small">{{ `Created: ${snap.created_at}` }}</div>
                            <div class="description-small">{{ `Images: ${snap.count}` }}</div>
                            <div class="description-small">
                                {{ `Groups: ${snap.groups_count}` }}
                            </div>
                        </div>
                    </div>
                    <div v-if="!snapshots">No snapshots - create new</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { apiUrl } from '../config/apiUrl';
import RangeSlider from './RangeSlider';
import { eventBus } from '@/EventBus';

export default {
    name: 'Dataset',
    props: {
        dataset: String,
        userId: Number,
        handleChangeDataset: Function,
        selectedImgCount: Number,
        toggleWasmMode: Function,
        wasmMode: Boolean,
        // getStore: Function,
    },
    components: {
        RangeSlider,
    },
    data() {
        return {
            datasets: [],
            loading: false,
            // imgCount: process.env
            imgCount: this.selectedImgCount,
            maxCount: 0,
            selectedDataset: this.dataset,
            name: '',
            snapshots: [],
            startNew: false,
            useSnapshots: false,
            loadingSnapshots: false,
        };
    },
    async mounted() {
        eventBus.$emit('set-loading', true);
        try {
            console.log('load dataset after mounting');
            const res = await fetch(`${apiUrl}/api/v1/dataset/all`);
            console.log(res);
            if (!res.ok) {
                this.$notify({
                    group: 'default',
                    title: 'Error loading all datasets',
                    type: 'error',
                    text: res.statusText,
                });
            } else {
                this.datasets = await res.json();
                this.name = this.datasets[0] && this.datasets[0].name;
                this.maxCount = this.datasets[0] && this.datasets[0].size;
            }
        } catch (e) {
            console.error(e);
            this.$notify({
                group: 'default',
                title: 'Error loading all datasets',
                type: 'error',
                text: e.message,
            });
        }
        eventBus.$emit('set-loading', false);
    },
    methods: {
        selectDataset(id) {
            console.log('selectDataset', id);
            if (this.selectedDataset === id) {
                this.selectedDataset = null;
                this.name = '';
                this.startNew = false;
                this.useSnapshots = false;
            } else {
                this.selectedDataset = id;
                this.startNew = false;
                this.useSnapshots = false;
                const { size, name } = this.datasets.find(e => e.id === this.selectedDataset);
                this.name = name;
                this.maxCount = size;
                this.imgCount = size < 500 ? size : 500;
            }
        },
        changeImgCount({ target }) {
            console.log('changeImgCount');
            const { size } = this.datasets.find(e => e.id === this.selectedDataset);
            // console.log(target.value);
            // console.log(size, this.selectedDataset);
            this.imgCount = +target.value <= size ? +target.value : size; // < 500 ? 500 : +target.value;
        },
        startLoadingNewDataset() {
            this.handleChangeDataset(this.selectedDataset, this.name, this.imgCount);
        },
        handleStartNew() {
            console.log('handleStartNew');
            this.startNew = !this.startNew;
            this.useSnapshots = false;
        },
        async handleLoadSnapshots() {
            console.log('handleLoadSnapshots');
            this.useSnapshots = !this.useSnapshots;
            this.startNew = false;
            if (this.useSnapshots) {
                // start loading
                this.loadingSnapshots = true;
                const res = await fetch(
                    `${apiUrl}/api/v1/snapshots?userid=${this.userId}&dataset=${this.selectedDataset}&`,
                );
                console.log(res);
                if (!res.ok) {
                    this.$notify({
                        group: 'default',
                        title: 'Error loading snapshots',
                        type: 'error',
                        text: res.statusText,
                    });
                } else {
                    this.snapshots = await res.json();
                    console.log('snapshots from API: ', this.snapshots);
                }
                this.loadingSnapshots = false;
            }
        },

        async selectSnapshot(snapshotId) {
            console.log('selectSnapshot', snapshotId);
            const response = await fetch(`${apiUrl}/api/v1/snapshots/load?snapshot=${snapshotId}&userid=${this.userId}`);
            if (!response.ok) {
                this.$notify({
                    group: 'default',
                    title: 'Error selecting snapshot',
                    type: 'error',
                    text: response.statusText,
                });
                return;
            }
            const snapshotData = await response.json();
            console.log('received snapshot data successfully');
            this.handleChangeDataset(
                snapshotData.dataset, this.name, snapshotData.count, snapshotData.nodes,
                snapshotData.groups, snapshotData.modelChanged,
            );
        },
    },
};
</script>

<style scoped>
.btn-item {
    padding: 0 8px;
    margin: 0.3rem;
}

.middle {
    width: 1000px;
    max-width: 1000px;
}

.header {
    font-size: 1.3rem;
    font-weight: 600;
    color: #767676;
    padding: 10px 0 4px 8px;
}

.items {
    flex-grow: 1;
    margin: 3px;
    display: flex;
    flex-wrap: wrap;
    /*padding: 2px;*/
}

.title-dataset {
    margin-top: 0.7rem;
    font-weight: 800;
}

.description {
    margin-bottom: 0.3rem;
    font-weight: 400;
}

.description-small {
    /*padding: 2px;*/
    font-size: 11px;
    font-style: italic;
    font-weight: 400;
}

.loading {
    display: flex;
    justify-content: center;
}

.slider-input {
    font-size: 12px;
}
</style>
