import * as express from 'express';
import BaseController from '../../helper/baseController';
import supabaseClient from "../../helper/SupabaseClient";

class AuthService extends BaseController {
    public ping = async (request: express.Request, response: express.Response) => {
        try {
            const result = {
                payload: { msg: "Welcome to master service" },
                message: "ping successful"
            }
            return this.getSuccessResponse(response, result);
        } catch (err) {
            return this.getFailResponse(response, err, "ping failed");
        }
    }

    public registerUser = async (request: express.Request, response: express.Response) => {
        try {
            const { email, password, phone } = request.body;
            const result = {
                payload: {},
                message: "User successfully registered."
            };
            const { data, error } = await supabaseClient.client.auth.signUp({ email, password, phone });

            if (error) { throw error; }

            if (data) { result.payload = data; }
            return this.getSuccessResponse(response, result);
        } catch (err) {
            return this.getFailResponse(response, err.status, err.message);
        }
    }

    public loginUser = async (request: express.Request, response: express.Response) => {
        try {
            const { email, password } = request.body;
            const result = {
                payload: {},
                message: "User successfully logged in."
            };
            const { data, error } = await supabaseClient.client.auth.signInWithPassword({ email, password });

            if (error) { throw error; }

            if (data.session && data.user) {
                const userData = await supabaseClient.client.from('users').select('*').eq('id', data.user.id)
                result.payload = {
                    authToken: data.session.access_token,
                    refreshToken: data.session.refresh_token,
                    user: { ...userData.data[0], email: data.user.email }
                };
            }
            return this.getSuccessResponse(response, result);
        } catch (err) {
            return this.getFailResponse(response, err.status, err.message);
        }
    }

    public logoutUser = async (request: express.Request, response: express.Response) => {
        try {
            const result = {
                payload: {},
                message: "User successfully logged out."
            };
            const { data, error } = await supabaseClient.client.auth.signOut();

            if (error) {
                throw error;
            }
            return this.getSuccessResponse(response, result);
        } catch (err) {
            return this.getFailResponse(response, err.status, err.message);
        }
    }
}

export default new AuthService();