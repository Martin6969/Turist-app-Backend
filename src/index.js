import express from 'express';
import connect from './db.js';
import cors from 'cors';
import Auth from './auth.js';
import mongo from 'mongodb';

const app = express() 
const port = 3100;

app.use(cors());
app.use(express.json());

//Registracija
app.post('/user', async (req , res) =>{
    let userData = req.body;
    let id;
    try{
        id = await Auth.registerUser(userData);
    }
    catch(e){
        res.status(500).json({ error: e.message });
    }

    res.json({ id:id })

});

//Prijava
app.post('/login', async (req, res) =>{
    let user = await req.body;
    let userEmail = user.email 
    let userPassword = user.password 
    
    try{
       let authResult = await Auth.authenticateUser(userEmail, userPassword);
       res.json(authResult);
    }
    catch(e) {
        res.status(401).json({ error: e.message })
    }
})

//Dohvat svih korisnika iz baze
app.get('/users', async (req , res) =>{
    let db = await connect();
    let cursor = await db.collection('users').find({});
    let results = await cursor.toArray();
    res.json(results);
});

app.get('/secret', [Auth.verify], (req,res) => {
    res.json({message: "This is a secret" + req.jwt.email})
})

//Slanje podataka o gradu
app.post('/city', async (req , res) =>{
    let db = await connect();

    let cityData = req.body;
    
    let result = await db.collection('cities').insertOne(cityData);
    if (result.insertedCount == 1) {
        res.send({
            status: 'success',
            id: result.insertedId,
        });
    } 
    else {
        res.send({
            status: 'fail',
        });
    }

    console.log(result);

});

app.listen(port, () => console.log(`Listening on port: ${port}!`)) 