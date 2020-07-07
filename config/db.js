const mongoose = require('mongoose');
// mongodb+srv://kleav516:naTqj1p5sbB8bBaY@devcamper0-myuwy.mongodb.net/dev-camper-db?retryWrites=true&w=majority

const connectDB = async () => {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    });

    console.log(`Mongo DB Connected: ${conn.connection.host}`.cyan.bold);
}

module.exports = connectDB;