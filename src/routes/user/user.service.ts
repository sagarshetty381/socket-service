import * as express from 'express';
import BaseController from '../../helper/baseController';
import supabaseClient from "../../helper/SupabaseClient";

class UserService extends BaseController {
    public registerUser = async (request: express.Request, response: express.Response) => {
        try {
            const userDetails = request.body;
            const { data, error } = await supabaseClient.client.from('users').insert([userDetails]);

            if (error) { throw new Error(error.message); }

            const result = {
                payload: data,
                message: "User details saved successfully."
            };
            return this.getSuccessResponse(response, result);
        }
        catch (err) {
            return this.getFailResponse(response, err, "Error while saving the user details.");
        }
    }

    public uploadImage = async (request: express.Request, response: express.Response) => {
        try {
            const { body: { path }, files }: any = request;
            const { data, error } = await supabaseClient.client
                .storage
                .from('uploads')
                .upload(path, files[0].buffer, {
                    contentType: files[0].mimetype,
                });

            if (error) { throw new Error(error.message); }

            const result = {
                payload: data,
                message: "Image uploaded successfully."
            };
            return this.getSuccessResponse(response, result);
        }
        catch (err) {
            return this.getFailResponse(response, err, "Error while uploading the image.");
        }
    }

    public updateProfileDetails = async (request: express.Request, response: express.Response) => {
        try {
            const userDetails = request.body;
            const { data, error } = await supabaseClient.client.from('users').update(userDetails).eq('id', userDetails.id).select();

            if (error) { throw new Error(error.message); }

            const result = {
                payload: data[0],
                message: "User details updated successfully."
            };
            return this.getSuccessResponse(response, result);
        }
        catch (err) {
            return this.getFailResponse(response, err, "Error while updating the user details.");
        }
    }
}

export default new UserService();