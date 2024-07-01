import * as jwt from 'jsonwebtoken';
import BaseController from './baseController';

export class JWTAuth extends BaseController{ 
    public verify(tokenKey: string) { 
        return (req: any, res: any, next: any) => { 
            if (req.headers.authorization && req.headers.authorization.startsWith('JWT ')) {
                const token = req.headers.authorization.split(' ')[1];
                jwt.verify(token, tokenKey, (err: any, decoded: any) => {
                    if (err) {
                        return this.getFailResponse(res, 401, 'Unauthorized user.');
                    }
                    next();
                });
            } else { 
                return this.getFailResponse(res, 401, 'Authorization token not found.');
            }
        }
    }
}