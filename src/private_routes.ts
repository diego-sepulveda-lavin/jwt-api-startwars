/**
 * Pivate Routes are those API urls that require the user to be
 * logged in before they can be called from the front end.
 * 
 * Basically all HTTP requests to these endpoints must have an
 * Authorization header with the value "Bearer <token>"
 * being "<token>" a JWT token generated for the user using 
 * the POST /token endpoint
 * 
 * Please include in this file all your private URL endpoints.
 * 
 */


import { Router, Request, Response, NextFunction } from 'express';
import { safe } from './utils';
import * as actions from './actions';
import jwt from 'jsonwebtoken'

// declare a new router to include all the endpoints
const router = Router();

export interface IPayload {
    user: {
        id: number,
        first_name: string,
        last_name: string,
        email: string,
        password: string
    }
    iat: number;
    exp: number
}

//middleware de verificación
const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    //headers con el token
    const token = req.header('Authorization');
    if (!token) return res.status(400).json('ACCESS DENIED');
    try {
        const decoded = jwt.verify(token as string, process.env.JWT_KEY as string) as IPayload
        console.log(decoded)
        //req.user = decoded;
        req.userId = decoded.user.id
        next()
    } catch (error) {
        return res.status(400).json('ACCESS DENIED');
    }


}

router.get('/user', verifyToken, safe(actions.getUsers));
router.get('/planet', verifyToken, safe(actions.getPlanets));
router.post('/addPlanet', verifyToken, safe(actions.addPlanet));
router.post('/addFavPlanet/:userid/:planetid', verifyToken, safe(actions.addFavPlanet));
router.get('/getUserById', verifyToken, safe(actions.getUsersByTokenId));

export default router;
