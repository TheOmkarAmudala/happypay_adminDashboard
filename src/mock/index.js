
import { createServer } from 'miragejs'
import { API_BASE_URL } from 'configs/AppConfig';

import { signInUserData } from './data/authData'

import { authFakeApi } from './fakeApi'

export default function mockServer({ environment = 'test' }) {
    return createServer({
        environment,
        seeds(server) {
			server.db.loadData({
				signInUserData
			})
		},
        routes() {
            this.urlPrefix = ''
            this.namespace = ''

            // allow real backend
            this.passthrough('https://test.happypay.live/**')

            // ❌ REMOVE fake auth
            // authFakeApi(this, API_BASE_URL)
        },
    })
}