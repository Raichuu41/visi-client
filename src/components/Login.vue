<template>
    <div class="body">
        <form id="loginForm"
        @submit="login">
            <div class="area login">
                <label>
                    <div class="title login">Username</div>
                    <eva-input class="login-fields"
                        placeholder="Your username..."
                        :status="user ? 'success' : 'danger'"
                        v-model="user" />
                </label>
                <label>
                    <div class="title login">Password</div>
                    <eva-input class="login-fields"
                               placeholder="Your password..."
                               :status="password ? 'success' : 'danger'"
                               type="password"
                               v-model="password" />
                </label>
                <v-btn :class="{ active: loading }"
                       :disabled="verifyInput()"
                       class="btn margin"
                    type="submit">login</v-btn>
                <div class="title" style="color: red" v-if="error">{{ error }}</div>
                <div class="title" style="color: red" v-if="loading">Loading...</div>
            </div>
        </form>
    </div>
</template>

<script>
import { apiUrl } from '@/config/apiUrl';

export default {
    name: 'Login',
    props: ['setAuth'],
    data: () => ({
        user: '',
        password: '',
        error: '',
        loading: false,
    }),
    methods: {
        verifyInput() {
            return (!this.user || !this.password);
        },

        async login() {
            this.loading = true; // start loading
            // console.log('Login :', this.user, this.password);
            this.error = ''; // reset error

            try {
                const body = {
                    user: this.user,
                    password: this.password,
                };
                const res = await fetch(`${apiUrl}/api/v1/login`, {
                    method: 'POST',
                    headers: { 'Content-type': 'application/json' },
                    body: JSON.stringify(body),
                });
                console.log(res);
                if (!res.ok) throw Error(res.statusText);
                const data = await res.json();

                if (data.isAuth) {
                    this.setAuth(data.id, data.user);
                    this.$notify({
                        group: 'default',
                        title: 'Login successful',
                        type: 'success',
                    });
                } else {
                    throw Error(data.message);
                }
            } catch (e) {
                this.error = e.message;
                console.log(e);
                console.log(e.message);
                this.$notify({
                    group: 'default',
                    title: 'Error log in',
                    type: 'error',
                    text: e.message,
                });
            }
            this.loading = false;
            // if (process.env.NODE_ENV === 'development') this.setAuth(0);
        },
    },
};
</script>

<style scoped>
.body {
    width: 100%;
    height: calc(100% - 45px);

    display: flex;
    justify-content: center;
    align-items: center;
}

.login-fields {
    width: 20rem;
    padding-right: 8px;
    padding-left: 8px;
}

.login {
    width: 20rem;
    padding-right: 8px;
    padding-top: 0.5rem;
}

.title.login {
    text-align: left;
    padding: 8px
}
input {
    width: 90%;
    margin: 8px;
    padding: 4px;
}

.margin {
    width: min-content;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}
</style>
