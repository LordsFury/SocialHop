const mongoose=require('mongoose');
mongoose.connect(process.env.MONGO_URL);

const userSchema=mongoose.Schema({
    name: String,
    username: String,
    email: String,
    password: String,
    address: {
        type: String,
        default: ""
    },
    followers: [{
        type: mongoose.Schema.Types.ObjectId ,
        ref: "user"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId ,
        ref: "user"
    }],
    profilepic: {
        type: String,
        default: "image.png"
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "post"
    }]
});

module.exports=mongoose.model("user",userSchema);