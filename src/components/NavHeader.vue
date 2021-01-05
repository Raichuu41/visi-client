<template>
    <div class="header">
        <div class="left-header">
            <div class="title-header"></div>
            <router-link class="title-header" to="/explorer">
                Visual Similarity Explorer:
            </router-link>
            <div v-if="explorer" class="dataset-name">{{ name }}</div>
        </div>

        <div class="right-header">
            <div v-if="explorer" @click="handleDataset" class="icon" v-tooltip="'switch dataset'">
                <database></database>
            </div>
            <div v-if="explorer" @click="showSave" class="icon"
                 v-tooltip="'save groups and embedding'">
                <save></save>
            </div>
            <div
                v-if="explorer"
                :class="{ active: showSettings }"
                @click="toggleSettings"
                class="icon"
                v-tooltip="'settings'">
                <settings></settings>
            </div>
            <div
                v-if="explorer"
                :class="{ active: help }"
                @click="toggleHelp"
                class="icon"
                v-tooltip="help ? 'close help' : 'show help'">
                <help></help>
            </div>
            <div v-if="this.userName !== null" class="user-name"
                 v-tooltip="`Logged in as ${this.userName}`">
                {{this.userName}}
            </div>
            <router-link v-if="isAuth" to="/logout" v-tooltip="'logout'">
                <logout></logout
            ></router-link>
        </div>
        <modal name="saveSnapshot" :resizable="true" height="auto" width="450px">
            <div class="vue-dialog">
                <div class="dialog-content">
                    <div class="dialog-c-title">
                        Save Snapshot
                    </div>
                    <div class="dialog-c-text">
                        Are you sure you want create a snapshot?
                        <br>
                    </div>
                        <p>
                            <label for="snapshotName">Snapshot Name:</label>
                            <eva-input
                            id="snapshotName"
                            v-model="snapshotName"
                            type="text"
                            name="snapshotName"
                            :status="verifySnapshotName() ? 'success' : 'danger'"
                            placeholder="Please enter a name"/>
                        </p>
                        <div class="vue-dialog-buttons">
                            <button class="vue-dialog-button button"
                                    @click="checkSnapshotName"
                            :disabled="!snapshotName">Ok</button>
                            <button class="vue-dialog-button button" @click="closeSave">
                                Cancel
                            </button>
                        </div>
                </div>
            </div>
        </modal>
    </div>
</template>
<script>
import Send from '../icons/Send';
import Help from '../icons/Help';
import Logout from '../icons/Logout';
import Database from '../icons/Database';
import Save from '../icons/Save';
import Settings from '../icons/Settings';
import { DATASET } from '@/util/modes';
import apiUrl from "@/config/apiUrl";
// import bus from '../EventBus';

export default {
    name: 'NavHeader',
    components: {
        Send,
        Help,
        Logout,
        Settings,
        Database,
        Save,
    },
    props: {
        wasmMode: Boolean,
        toggleWasmMode: Function,
        isAuth: Boolean,
        name: String,
        userName: String,
        userId: Number,
    },
    data: () => ({
        loading: false,
        explorer: false,
        help: true,
        showSettings: false,
        snapshotName: '',
        snapshotError: '',
    }),
    methods: {
        verifySnapshotName() {
            if (!this.snapshotName) {
                this.snapshotError = 'Snapshot name required!';
                return false;
            }
            this.snapshotError = '';
            return true;
        },
        checkSnapshotName() {
            if (this.verifySnapshotName()) {
                this.$modal.hide('saveSnapshot');
                this.$root.explorer.saveSnapshot(this.snapshotName);
                this.snapshotName = '';
            }
        },
        async resetTemporaryModel() {
            const res = await fetch(`${apiUrl}/api/v1/snapshots/resetTempModel?userid=${this.userId}`);
            console.log(res);
            if (!res.ok) {
                this.$notify({
                    group: 'default',
                    title: 'Error resetting temporary model',
                    type: 'error',
                    text: res.statusText,
                });
            }
        },
        updateEmbedding() {
            console.log('updateEmbedding');
            console.log(this.$root.explorer);
            this.$modal.show('dialog', {
                title: 'Update embedding?',
                text: 'It will take a while until the embedding has been updated.',
                buttons: [
                    {
                        title: 'Ok',
                        handler: () => {
                            this.$root.explorer.sendData();
                            this.$modal.hide('dialog');
                        },
                    },
                    {
                        title: 'Cancel',
                        default: true, // Will be triggered by default if 'Enter' pressed.
                        // handler: () => {}, // Button click handler
                    },
                ],
            });
        },
        toggleHelp() {
            console.log('toggleHelp');
            this.help = this.$root.explorer.showHelp = !this.$root.explorer.showHelp;
        },
        toggleSettings() {
            console.log('toggleHelp');
            this.showSettings = this.$root.explorer.showSettings = !this.$root.explorer
                .showSettings;
        },
        handleDataset() {
            this.$modal.show('dialog', {
                title: 'Back to dataset selection?',
                text: 'You will lose your defined groups and your spatial arrangement of images',
                buttons: [
                    {
                        title: 'Ok',
                        handler: () => {
                            this.resetTemporaryModel();
                            this.$modal.hide('dialog');
                            this.$router.push({ name: DATASET });
                        },
                    },
                    {
                        title: 'Cancel',
                        default: true, // Will be triggered by default if 'Enter' pressed.
                    },
                ],
            });
        },
        showSave() {
            this.snapshotError = '';
            this.$modal.show('saveSnapshot');
        },
        closeSave() {
            this.$modal.hide('saveSnapshot');
            this.snapshotName = '';
        },
    },
    mounted() {
        // save here for global accesse
        this.$root.navheader = this;
    },
};
</script>

<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    height: 40px;
    box-shadow: 0 2px 3px rgba(32, 33, 36, 0.28);
    margin-bottom: 3px;
}

.title-header {
    padding-left: 0.5rem;
    font-weight: bold;
    font-size: 1.5rem;

    border-bottom: none;
}

.left-header,
.right-header {
    display: flex;
    align-items: center;
}

/*used for header nav links*/
a,
.icon {
    text-decoration: none;
    cursor: pointer;

    display: flex;
    align-items: center;

    height: 30px;

    font-weight: bold;
    padding: 0 0.7rem;
    margin: 5px 0;
    color: #767676;
}

a:hover {
    color: #484848;
}

icon:hover {
    color: #484848;
}

.dataset-name {
    display: flex;
    align-items: center;

    color: #767676;
    font-weight: 400;
    font-size: 1.3rem;

    padding-left: 5px;
}

.user-name {
    display: flex;
    align-items: center;

    color: #767676;
    font-weight: 400;
    font-size: 1.3rem;

    padding-left: 5px;
}

</style>
