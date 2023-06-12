import express from 'express';
import connect from './db.js';
import cors from 'cors';
import Auth from './auth.js';
import mongo from 'mongodb';

const { ObjectId } = require('mongodb');

const app = express() 
const port = 3100;

app.use(cors());
app.use(express.json());

//Registracija
app.post('/korisnik', async (req , res) =>{
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
app.post('/prijava', async (req, res) =>{
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
app.get('/korisnici', async (req , res) =>{
    let db = await connect();
    let cursor = await db.collection('users').find({});
    let results = await cursor.toArray();
    res.json(results);
});

app.get('/secret', [Auth.verify], (req,res) => {
    res.json({message: "This is a secret" + req.jwt.email})
})

//Slanje podataka o gradu
app.post('/grad', async (req , res) =>{
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

//Dohvat svih gradova iz baze
app.get('/gradovi', async (req , res) =>{
    let db = await connect();

    let cursor = await db.collection('cities').find({});
    let cities = await cursor.toArray();
    
    res.json(cities);
});

app.get('/gradovi/:zupanija', async (req , res) => {
    let zupanija = req.params.zupanija;
    let db = await connect();

    console.log("Zupanije: ",zupanija);
    let singleDoc = await db.collection('cities').find({zupanija: zupanija});
    let results = await singleDoc.toArray();
    
    res.json(results);
});

app.post('/omiljeni_gradovi', async (req, res) => {
    let db = await connect();
    let wishlist = req.body;
  
    try {
      await db.collection('wishlist').createIndex({ korisnik: 1, grad: 1 }, { unique: true });
      let result = await db.collection('wishlist').insertOne(wishlist);
  
      if (result.insertedCount == 1) {
        res.send({
          status: 'success',
          id: result.insertedId,
        });
      } else {
        res.send({
          status: 'fail',
        });
      }
    } catch (error) {
      if (error.code === 11000) {
        res.send({
          status: 'fail',
          message: 'Korisnik već ima unesen taj grad.',
        });
      } else {
        console.error('Greška:', error);
        res.send({
          status: 'fail',
        });
      }
    }
  });

app.get('/omiljeni_gradovi/:korisnik', async (req , res) => {
    let korisnik = req.params.korisnik;
    let db = await connect();

    console.log(korisnik)
    let singleDoc = await db.collection('wishlist').find({korisnik: korisnik})
    let results = await singleDoc.toArray();
    
   
    res.json(results)
});

app.post("/omiljeni_gradovi/delete/:id", async (req, res) => {
    
	let id = req.params.id;
	let db = await connect();
	let result = await db.collection("wishlist").deleteOne({ _id: ObjectId(id) });
	if (result && result.deletedCount == 1) {
		res.json(result);
	} else {
		res.json({
			status: "fail",
		});
	}
});


app.listen(port, () => console.log(`Slušam na portu: ${port}!`)) 