import { MongoClient } from 'mongodb';
import "dotenv/config";


const url = process.env.MONGODB_URI;
let client
export const connectToMongoDB = () => {
    MongoClient.connect(url)
        .then(clientInstance => {
            client = clientInstance
            console.log("Mongodb is connected");
        }).catch(err => {

            console.log(err);
        })
}

export const getdb =() =>{
    return client.db();
}

