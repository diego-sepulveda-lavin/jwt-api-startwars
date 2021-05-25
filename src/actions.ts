import { Request, Response } from 'express'
import { getRepository } from 'typeorm'  // getRepository"  traer una tabla de la base de datos asociada al objeto
import { User } from './entities/User'
import { Exception } from './utils'
import jwt from 'jsonwebtoken'
import { Planet } from './entities/Planet'

export const createUser = async (req: Request, res: Response): Promise<Response> => {

    // important validations to avoid ambiguos errors, the client needs to understand what went wrong
    if (!req.body.first_name) throw new Exception("Please provide a first_name")
    if (!req.body.last_name) throw new Exception("Please provide a last_name")
    if (!req.body.email) throw new Exception("Please provide an email")
    if (!req.body.password) throw new Exception("Please provide a password")

    const userRepo = getRepository(User)
    // fetch for any user with this email
    const user = await userRepo.findOne({ where: { email: req.body.email } })
    if (user) throw new Exception("Users already exists with this email")

    const newUser = getRepository(User).create(req.body);  //Creo un usuario
    const results = await getRepository(User).save(newUser); //Grabo el nuevo usuario 
    return res.json(results);
}

export const getUsers = async (req: Request, res: Response): Promise<Response> => {
    const users = await getRepository(User).find({relations:["planets"]});
    return res.json(users);
}

export const getPlanets = async (req: Request, res: Response): Promise<Response> => {
    const planets = await getRepository(Planet).find();
    return res.json(planets);
}

export const addPlanet = async (req: Request, res: Response): Promise<Response> => {
    const planetRepo = getRepository(Planet)
    const newPlanet = planetRepo.create()
    newPlanet.name = req.body.nombrePlaneta
    const result = await planetRepo.save(newPlanet);
    return res.json(result);
}

export const addFavPlanet = async (req: Request, res: Response): Promise<Response> => {
    const planetRepo = getRepository(Planet)
    const userRepo = getRepository(User)

    const user = await userRepo.findOne(req.params.userid, {relations:["planets"]})
    const planet = await planetRepo.findOne(req.params.planetid)

    if (user && planet) {
        user.planets = [...user.planets,planet]
        const results = await userRepo.save(user)
        return res.json(results)

    }
    return res.json("Error")


}

//controlador para el logueo
export const login = async (req: Request, res: Response): Promise<Response> => {

    if (!req.body.email) throw new Exception("Please specify an email on your request body", 400)
    if (!req.body.password) throw new Exception("Please specify a password on your request body", 400)

    const userRepo = await getRepository(User)

    // We need to validate that a user with this email and password exists in the DB
    const user = await userRepo.findOne({ where: { email: req.body.email, password: req.body.password } })
    if (!user) throw new Exception("Invalid email or password", 401)

    // this is the most important line in this function, it create a JWT token
    const token = jwt.sign({ user }, process.env.JWT_KEY as string, { expiresIn: "24h" });

    // return the user and the recently created token to the client
    return res.json({ user, token });
}

export const getUsersByTokenId = async (req: Request, res: Response): Promise<Response> => {
    const users = await getRepository(User).find();
    return res.json(users);
}

