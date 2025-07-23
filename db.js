const mongoose = require('mongoose');
const url = process.env.MONGO_URI;

const connectToMongo = async () => {
    try {
        await mongoose.connect(url);
        console.log("Connected to MongoDB successfully");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    }
}
module.exports = connectToMongo;