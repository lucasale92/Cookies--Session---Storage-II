import mongoose from 'mongoose';

const url = "mongodb+srv://riveroslucas07:xoUHYq5jW5OJjiWR@ecommerce.36h98by.mongodb.net/ecommerce?retryWrites=true&w=majority"


const connectToDB = () => {
    try {
        mongoose.connect(url)
        console.log('connected to DB e-commerce')
    } catch (error) {
        console.log(error);
    }
};

export default connectToDB