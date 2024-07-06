import * as express from 'express';

class BaseController {
    constructor() {
    }

    public async getSuccessResponse(response: express.Response, data: any) {
        const result = {
            success: true,
            payload: data.payload,
            message: data.message,
            code: 200,
            error: null
        }
        response.send(result);
    }

    public async getFailResponse(response: express.Response, code: any, message: string) {
        const result = {
            success: false,
            code,
            message,
            error: true
        }
        this.sendResponse(response,result);
    }

    public sendResponse(response : express.Response, res: any): any {
        return response.status(res.code).json(res);
    }
}

export default BaseController;