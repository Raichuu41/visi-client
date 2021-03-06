<template>
    <div class="area neighbours">
        <div class="row-between">
            <div class="title">Proposals</div>
            <div :class="{ active: loading }" @click="stop" class="btn">
                <x></x>
            </div>
        </div>
        <div class="between">
            <range-slider
                :change="changeNeighboursThreshold"
                :value="neighboursThreshold"
            ></range-slider>
            <div class="btn dummy">{{ `${neighboursThreshold}#` }}</div>
        </div>
        <div class="row hint"># proposals in next iteration</div>
        <repeat v-if="!loading"></repeat>
        <div class="loader" v-if="loading"></div>
        <div class="row">
        <div class="row">
            <button :disabled="loading" @click="getGroupNeighbours" class="btn">
                Update proposals
            </button>
        </div>
        </div>
        <div class="row">
            <button class="btn" @click="addAllNeighbours" :disabled="!addAllAvailable">
                Add all proposals
            </button>
        </div>
    </div>
</template>

<script>
import RangeSlider from './RangeSlider';
import Repeat from '../icons/Repeat';
import X from '../icons/X';
import socket from '@/util/socketBackend';

export default {
    name: 'Neighbours',
    props: [
        'getStore',
        'neighboursThreshold',
        'changeNeighboursThreshold',
        'activeGroupId',
        'stop',
        'addAllAvailable',
    ],
    components: {
        RangeSlider,
        Repeat,
        X,
    },
    data: () => ({
        loading: false,
        current_neighbours: undefined,
    }),
    mounted() {
        socket.on('BE-getGroupNeighbours', this.getGroupNeighboursOn);
        this.$nextTick(this.getGroupNeighbours);
    },
    beforeDestroy() {
        this.resetNeighbours();
    },
    methods: {
        getGroupNeighboursOn(data) {
            const { neighbours, group, status } = data;
            if (status !== 'success') {
                this.$notify({
                    group: 'default',
                    title: 'Error loading proposals',
                    type: 'error',
                    text: data.error,
                });
            } else {
                const store = this.getStore();
                store.updateGroupProposals(neighbours);
                // store.addNodesToActiveGroup(group);
                this.current_neighbours = neighbours;
                this.loading = false;
                this.addAllAvailable = true;
            }
        },

        getGroupNeighbours() {
            if (this.loading) {
                this.$notify({
                    group: 'default',
                    title: 'Cannot load proposals',
                    type: 'error',
                    text: 'wait until finish loading',
                });
            } else {
                this.loading = true;
                this.addAllAvailable = false;
                const store = this.getStore();
                store.resetScaleTranslate();
                const body = {
                    positives: store.getNodeIdsByGroupId(this.activeGroupId),
                    threshold: this.neighboursThreshold,
                    groupId: this.activeGroupId,
                    userId: this.$parent.userId,
                };
                if (
                    Object.keys(store.proposals).length
                    || Object.keys(store.removedProposals).length
                ) {
                    body.negatives = Object.keys(store.proposals).map(key => +key);
                }
                socket.emit('getGroupNeighbours', body);
            }
        },

        resetNeighbours() {
            this.getStore().resetGroupNeighbours();
        },

        async addAllNeighbours() {
            const store = this.getStore();
            const neighbourIds = Object.keys(this.current_neighbours);
            store.addNodesToActiveGroup(neighbourIds);
            await this.getGroupNeighbours();
        },
    },
};
</script>

<style scoped>
.neighbours {
    margin: 0.5rem;
}

.hint {
    font-size: small;
    font-style: italic;
    padding-left: 0.5rem;
    padding-top: -0.5rem;
    margin-bottom: 0.5rem;
}
</style>
