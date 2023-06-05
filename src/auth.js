import dotenv from "dotenv";
dotenv.config();

import connect from './db.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

(async () =>{
let db = await connect();
await db.collection("users").createIndex({email: 1}, {unique: true});
})();

export default {
   async registerUser(user){
        console.log( 'Hello ', user, "!");
        let db = await connect();

        let doc = {
            name: user.name,
            email: user.email,
            password: await bcrypt.hash(user.password, 6),
        };
        try {
           let result = await db.collection("users").insertOne(doc);
            if(result && result.inesrtedId)
            {
                return result.insertedId; 
            }
        }
        catch(e){
            if(e.name == "MongoError" || e.code == 11000){
                throw new Error("User has same email!")
            }
        }

    },
    async authenticateUser(email, password){
        
        let db = await connect()
        let user = await db.collection("users").findOne({ email:email })
        
        if(user && user.password && (await bcrypt.compare(password, user.password))){
            delete user.password
            let token = jwt.sign(user, process.env.JWT_SECRET, {
                algorithm : "HS512",
                expiresIn: "2 weeks"
            }) 
            
            return{
               token,
               email:user.email,
            }
        }
       
        else{
            throw new Error("cannot authenticate")
        }
    },
    
    verify(req, res, next){
        try{
            let authorization = req.headers.authorization.split(' ');
            let type = authorization[0];
            let token = authorization[1];
            if(type !== "Bearer"){
                return res.status(401).send();
            }
            else{
                req.jwt =jwt.verify(token, process.env.JWT_SECRET);
                return next();
            }
        }
        catch(e){
           return res.status(401).send({Error: 'error'});
           
        }
    }
} 