require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const userModel = require('./models/userModel');
const postModel = require('./models/postModel');
const jwt = require('jsonwebtoken');
const cookieparser = require('cookie-parser');
const flash = require('connect-flash');
const bcrypt = require('bcrypt');
const expressSession = require('express-session');
const upload = require('./config/multerconfig');
const connectToMongo = require('./db');
const port=process.env.PORT || 3000;
const jwtSecret=process.env.JWT_SECRET;

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(expressSession({
    resave: false,
    saveUninitialized: false,
    secret: "abdul"
}));
app.use(flash());
app.use(cookieparser());
connectToMongo();

app.get("/", function (req, res) {
    res.render("index", { Message: req.flash('info') });
});

app.post("/register", async function (req, res) {
    try {
        let { name, username, email, password } = req.body;
        let user = await userModel.findOne({ email });
        if (user) {
            req.flash('info', 'User already registered');
            return res.redirect("/");
        }
        bcrypt.genSalt(10, function (err, salt) {
            bcrypt.hash(password, salt, async function (err, hash) {
                let createdUser = await userModel.create({
                    name,
                    username,
                    email,
                    password: hash
                });
                let token = jwt.sign({ email, userid: createdUser._id }, jwtSecret);
                res.cookie("token", token);
                req.flash('info', 'Account registered Successfully');
                return res.redirect("/");
            });
        });
    } catch (err) {
        console.log(err.message);
    }
});

app.get("/login", function (req, res) {
    res.render("login", { Message: req.flash('info') });
});

app.post("/login", async function (req, res) {
    let { email, password } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) {
        req.flash('info', 'Something went Wrong');
        return res.redirect("/login");
    }
    bcrypt.compare(password, user.password, function (err, result) {
        if (result) {
            let token = jwt.sign({ email: email, userid: user._id }, jwtSecret);
            res.cookie("token", token);
            return res.redirect("/home");
        }
        else {
            req.flash('info', 'Something went Wrong');
            return res.redirect("/login");
        }
    });
});

app.get("/home", isLoggedIn, async function (req, res) {
        let user = await userModel.findOne({ email: req.user.email });
        let allposts = await postModel.find().populate("user").populate("likes");
        res.render("home", { user, allposts, successMessage: req.flash('successMessage') });
});


app.get("/home/editProfile/:id", isLoggedIn, async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email });
    res.render("editProfile", { user });
});

app.post("/updateProfile/:id", isLoggedIn, upload.single("image"), async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email });
        if (req.file) {
            user.profilepic = req.file.filename;
            await user.save();
        }
        const { name, username, email, address } = req.body;
        await userModel.findOneAndUpdate(
            { _id: req.params.id },
            { name, username, email, address },
            { new: true }
        );
        res.redirect("/home");
});


app.get("/home/changePassword/:id", isLoggedIn, async function (req, res) {
    let user = await userModel.findOne({ email: req.user.email });
    res.render("changePassword", { user, Message: req.flash('info') });
});

app.post("/changePassword/:id", isLoggedIn, async function (req, res) {
    let { email, prev, newp } = req.body;
    let user = await userModel.findOne({ _id: req.params.id, email });
    if (!user) {
        req.flash('info', 'Something went wrong');
        return res.redirect("/home/changePassword/:id");
    }
    bcrypt.compare(prev, user.password, function (err, result) {
        if (result) {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(newp, salt, async function (err, hash) {
                    user.password = hash;
                    await user.save();
                });
            });
            let token = jwt.sign({ email, userid: user.id }, jwtSecret);
            res.cookie("token", token);
            req.flash('successMessage', 'Password updated successfully!');
            res.redirect("/home");
        }
        else {
            req.flash('info', 'Something went wrong');
            res.redirect("/home/changePassword/:id");
        }
    });
});

app.get("/home/post", isLoggedIn, function (req, res) {
    res.render("post", {Message: req.flash('info')});
})

app.post("/home/addPost", isLoggedIn, upload.single("photo"), async function(req,res){
    if(!req.file && !req.body.content){
        req.flash("info", "Post cannot be empty, Try Again");
        return res.redirect("/home/post");
    }
    let photo="";
    if(req.file){
        photo=req.file.filename;
    }
    let user=await userModel.findOne({email: req.user.email});
    let {caption, content, location}=req.body;
    let post=await postModel.create({
        pic: photo,
        caption,
        content,
        location,
        user: user._id
    });
    user.posts.push(post._id);
    await user.save();
    req.flash('successMessage', "Post Added Successfully");
    res.redirect("/home");
})

app.get("/home/viewProfile/:id", isLoggedIn, async function(req,res){
    let user = await userModel.findOne({ email: req.user.email }).populate({
        path: 'posts',
        populate: { path: 'likes', select: 'username profilepic' } 
    }).exec();
    res.render("viewProfile",{user, Message: req.flash('info')});
})

app.get("/posts/like/:id", isLoggedIn, async function (req, res) {
    const postId = req.params.id;
    let post=await postModel.findOne({_id: req.params.id}).populate("user");
    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
    }
    else{
        post.likes.splice(post.likes.indexOf(req.user.userid),1);
    }
    await post.save();
    res.redirect(req.get('Referer') + `#post-${postId}`);
})

app.get("/posts/delete/:id", isLoggedIn, async function (req, res) {
    let post=await postModel.findOne({_id: req.params.id});
    let user=await userModel.findOne({email: req.user.email});
    user.posts.splice(user.posts.indexOf(post._id), 1);
    await user.save();
    post=await postModel.findOneAndDelete({_id: req.params.id}).populate("user");
    req.flash("info","post deleted successfully");
    res.redirect(req.get('Referer'));
})

app.get("/posts/edit/:id", isLoggedIn, async function (req, res) {
    let user=await userModel.findOne({email: req.user.email});
    let post=await postModel.findOne({_id: req.params.id}).populate("user");
    if (!post) {
        req.flash('info', "Post not found");
        return res.redirect('/home');
    }
    let hasImage = post.pic && post.pic.trim() !== '';
    res.render("editPost", {user,post, hasImage, Message: req.flash("info")});
})

app.post("/home/updatePost/:id", isLoggedIn, upload.single("photo"), async function(req, res) {
    if (!req.file && !req.body.content && !req.body.caption && !req.body.location) {
        req.flash("info", "Post cannot be empty, Try Again");
        return res.redirect("/posts/edit/:id");
    }
    let photo = req.file ? req.file.filename : null;
    let { content, caption, location } = req.body;
    let user = await userModel.findOne({ email: req.user.email });
    let updateData = { content, caption, location, user: user._id };
    let post = await postModel.findOne(req.params.id);
    if (photo) {
        updateData.pic = photo;
    } else {
        updateData.pic = post.pic;
    } 
    Object.keys(updateData).forEach(key => {
        if (!updateData[key]) {
            delete updateData[key];
        }
    });
    await postModel.findOneAndUpdate(
        { _id: req.params.id },  
        { $set: updateData },     
        { new: true }            
    );

    req.flash('info', "Post Updated successfully");
    res.redirect(`/home/viewprofile/${req.params.id}`);
});

app.get("/home/friends/:id", isLoggedIn, async function(req, res) {
    let user = await userModel.findOne({email: req.user.email}).populate('following').populate('followers');
        if (!user) {
            req.flash('info', 'User not found!');
            return res.redirect('/home');
        }
        let followingUsers = user.following;
        let followersUsers = user.followers;
        let otherUsers = await userModel.find({
            _id: { $nin: [...followingUsers.map(u => u._id), ...followersUsers.map(u => u._id), user._id] }
        });
        res.render("friends", {
            user,
            followingUsers,
            followersUsers,
            otherUsers
        });
});

app.get("/friends/visitprofile/:id", isLoggedIn, async function(req, res){
    let user = await userModel.findOne({ _id: req.params.id }).populate({
        path: 'posts',
        populate: { path: 'likes', select: 'username profilepic' } 
    }).exec();
    let loggeduser=await userModel.findOne({email: req.user.email});
    let follower=user.following.includes(loggeduser.id);
    let following=user.followers.includes(loggeduser.id);
    res.render("visitprofile", {user, follower, following, loggeduser});
})

app.get("/friends/follow/:id", isLoggedIn, async function(req, res){
    let user=await userModel.findOne({email: req.user.email});
    let followUser=await userModel.findOne({_id: req.params.id});
    user.following.push(followUser._id);
    followUser.followers.push(req.user.userid);
    await user.save();
    await followUser.save();
    res.redirect(req.get('Referer'));
})

app.get("/friends/Unfollow/:id", isLoggedIn, async function(req, res){
    let user=await userModel.findOne({email: req.user.email});
    let followUser=await userModel.findOne({_id: req.params.id});
    user.following.splice(user.following.indexOf(followUser._id), 1);
    followUser.followers.splice(user.followers.indexOf(req.user.userid), 1);
    await user.save();
    await followUser.save();
    res.redirect(req.get('Referer'));
})

app.get("/friends/followback/:id", isLoggedIn, async function(req, res){
    let user=await userModel.findOne({email: req.user.email});
    let followUser=await userModel.findOne({_id: req.params.id});
    user.following.push(followUser._id);
    followUser.followers.push(req.user.userid);
    await user.save();
    await followUser.save();
    res.redirect(req.get('Referer'));
})

app.get("/friends/remove/:id", isLoggedIn, async function(req, res){
    let user=await userModel.findOne({email: req.user.email});
    let followUser=await userModel.findOne({_id: req.params.id});
    user.followers.splice(user.followers.indexOf(followUser._id), 1);
    followUser.following.splice(user.following.indexOf(req.user.userid), 1);
    await user.save();
    await followUser.save();
    res.redirect(req.get('Referer'));
})

app.get("/logout", isLoggedIn, function (req, res) {
    res.cookie("token", "");
    res.redirect("/login");
})

function isLoggedIn(req, res, next) {
    if (req.cookies.token === "") {
        req.flash('info', "You need to login first");
        return res.redirect("/login");
    }
    else {
        let data = jwt.verify(req.cookies.token, jwtSecret);
        req.user = data;
        next();
    }
}

app.listen(port, function () {
    console.log(`Server started on port ${port}`);
});
