import mongo from 'mongodb';

let connection_string= 'mongodb+srv://admin:admin@cluster0.5itjb0y.mongodb.net/?retryWrites=true&w=majority'

let client = new mongo.MongoClient(connection_string, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
let db = null

export default () => {
    return new Promise((resolve, reject) =>{

        if (db && client.isConnected()){
            resolve(db)
        }
        client.connect(err => {
            if(err){
                console.log("error")
                reject("Connection error: " + err)
            }
            else{
                console.log("Successful database connection!")
                db = client.db("tourist-app")
                resolve(db)
            }
        })
    })
}