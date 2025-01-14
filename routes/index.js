var express = require('express');
var router = express.Router();
const userModel=require("./users");
const postModel=require("./posts");
const passport=require("passport");
const path=require("path");
const multer=require('multer');
const upload=require("./multer")

//by below 2 lines we can say user login hota h 
const localStrategy= require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/login', function(req, res, next) {
  res.render("login" , {error: req.flash('error')});
});

router.get('/feed', function(req, res, next) {
  res.render("feed");
});

router.post('/upload',isLoggedIn,upload.single('file'), async function(req,res,next){
   if(!req.file){
    return res.status(400).send('No files were given');
   }
   
   const user= await userModel.findOne({username: req.session.passport.user});
   if (!user) {
    return res.status(404).send('User not found.');
  }
  
   const post=await postModel.create({
    image: req.file.filename,
    imageText:req.body.filecaption,
    user: user._id 
   });

  user.posts.push(post._id);
  await user.save();
   res.send("done");
});

// const staticDir = path.join(__dirname, 'stylesheets');
// router.use(express.static(staticDir));


router.get('/profile',isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
  .populate("posts");
  console.log(user)
  res.render("profile",{user});
});

// router.get('/profile', isLoggedIn, async function(req, res, next) {
//   try {
//     const user = await userModel.findOne({
//       username: req.session.passport.user 
//     });

//     console.log(user);

//     if (!user) {
//       throw new Error('User not found');
//     }

//     res.render("profile", { user });
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     next(error); // Pass the error to the error handling middleware
//   }
// });


router.post("/register",function(req,res){
  const userData= new userModel({
    username: req.body.username,
    email: req.body.email,
    fullname:req.body.fullname});

    userModel.register(userData,req.body.password)
    .then(function(){
      passport.authenticate("local")(req,res,function(){
        res.redirect("/profile");
      })
    })
})

router.post("/login", passport.authenticate("local",{
  successRedirect: "/profile",
  failureRedirect: "/login",
  failureFlash: true,
}),function(req,res){
  
})

router.get("/logout",function(req,res){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()) 
    return next();
  res.redirect("/login")
}

module.exports = router;










// router.get('/alluserposts', async function(req, res, next) {
//   let user = await userModel
//   .findOne({_id: "66389302676afa4177908cb4"})
//   .populate('posts')
//   res.send(user);
// });

// router.get('/createuser', async function(req, res, next) {
//   let createduser= await userModel.create({
//     username: "Ashish",
//     password:"Ashish",
//     posts: [],
//     email: "Ashish@mail.com",
//     fullName:"Ashish Agrawal"
//   })
//   res.send(createduser);
// });

// router.get('/createpost', async function(req, res, next) {
//   let createdpost = await postModel.create({
//     postText: "Hello everyone",
//     user: "66389302676afa4177908cb4"
//   })
//   let user = await userModel.findOne({_id: "66389302676afa4177908cb4"});
//   user.posts.push(createdpost._id);
//   await user.save();
//   res.send("done");
// });

