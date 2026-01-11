import { Response } from 'miragejs'
import uniqueId from 'lodash/uniqueId'
import isEmpty from 'lodash/isEmpty'

export default function authFakeApi (server, apiPrefix) {
    server.post(`${apiPrefix}/auth/login`, async (schema, { requestBody }) => {
        const { phoneNumber, passcode } = JSON.parse(requestBody);

        try {
            const response = await fetch('https://test.happypay.live/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phoneNumber,
                    passcode
                })
            });

            const data = await response.json();

            if (!response.ok) {
                return new Response(response.status, {}, data);
            }

            return data;

        } catch (error) {
            return new Response(
                500,
                {},
                { message: 'Unable to connect to login service' }
            );
        }
    });


    server.post(`${apiPrefix}/auth/loginInOAuth`, (schema) => {
        return {
            data: {
                token: 'wVYrxaeNa9OxdnULvde1Au5m5w63'
            }
        }
    })

    server.post(`${apiPrefix}/logout`, () => {
        return true
    })

    server.post(`${apiPrefix}/register`, (schema, {requestBody}) => {
        const { userName, password, email } = JSON.parse(requestBody)
        const emailUsed = schema.db.signInUserData.findBy({ email })
        const newUser = {
            userName,
            email,
        }

        if (!isEmpty(emailUsed)) {
            const errors = [
                {message: '', domain: "global", reason: "invalid"}
            ]
            return new Response(400, { some: 'header' }, { errors, message: 'User already used' })
        } 

        schema.db.signInUserData.insert({...newUser, ...{id: uniqueId('user_'), password, accountUserName: userName}})
        return {
            data: {
                token: 'wVYrxaeNa9OxdnULvde1Au5m5w63'
            }
        }
    })
}