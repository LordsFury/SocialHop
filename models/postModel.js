const mongoose=require('mongoose');

const postSchema=mongoose.Schema({
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],
    date: {
        type: Date,
        default: Date.now
    },
    pic: String,
    caption: String,
    content: String,
    location: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
});

module.exports=mongoose.model("post",postSchema);
