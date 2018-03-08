//REQUIREs
const handlebars = require('express-handlebars');
const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const csrf = require('csurf');
//LOCAL MODULES WRITTEN BY ME
const Query = require('./modules/queries.js');
const Password = require('./modules/password.js');
//APP
const app = express();
app.engine('handlebars', handlebars({defaultLayout : 'layout'}));
app.set('view engine', 'handlebars');
//attaching a token to all of requests
app.use((req,res,next)=>{
    res.setHeader('X-Frame-Options', 'DENY');
    next();
});
//cookies
app.use(cookieSession({
    name: 'session',
    secret: process.env.secret || 'daflkjadkfhe43479476245-204958967rgdsrt',
    maxAge: 1000 * 60 * 60 * 24 * 14
}));
app.use(bodyParser.urlencoded({extended: false}));
app.use(csrf());
app.use((req,res,next)=>{
    res.locals.csrfToken = req.csrfToken();
    //check if user is logged in
    if(req.session.user){
        res.locals.user = true;
    }
    if(req.session.signatureId){
        res.locals.signed = true;
    }
    next();
});
//serving static pages
app.use(express.static('./public/'));
//CHECKING THE EXISTING COOKIES AND REDIRECTING ACCORDINGLY
app.use((req,res,next)=>{
    if(!req.session.user  && req.url != '/register' && req.url != '/login'){
        res.redirect('/register');
    }else if(req.session.user && (req.url == '/register' || req.url == '/login')){
        res.redirect('/petition');
    }else if(req.session.user && !req.session.signatureId && req.url != '/petition' && req.url !='/logout'){
        res.redirect('/petition');
    }else if(req.session.user && req.session.signatureId && req.url == '/petition'){
        res.redirect('/signed');
    }else{
        next();
    }
});
//ROOT
app.get('/', (req,res)=>{
    res.redirect('/petition');
});
//REGISTER
app.get('/register', (req,res)=>{
    res.render('register');
});
app.post('/register', (req,res)=>{
    const {firstname, secondname, email, password, passwordRepeat} = req.body;
    if(firstname != '' && secondname != '' && email != '' && password != '' && passwordRepeat != ''){
        Query.dbGetUser(email).then(results=>{
            if(results.length != 0){
                res.render('register', {error: 'E-mail already exists in the database.'});
            }else{
                if(password != passwordRepeat){
                    res.render('register', {error: 'Passwords don\'t match'});
                }else{
                    //password
                    Password.hashPassword(password).then(pass=>{
                        Query.dbRegisterUser(req.body, pass).then(results=>{
                            req.session.user = {
                                firstname : firstname,
                                secondname : secondname,
                                email : email,
                                id : results[0].id
                            };
                            res.redirect('/petition');
                        }).catch(()=>{
                            res.render('register', {error : 'Something went wrong while trying to register a new user. Please try later.'});
                        });
                    }).catch(()=>{
                        res.render('register', {error : 'Something went wrong. Please contact the administrator.'});
                    });
                }
            }
        }).catch(()=>{
            res.render('register',{error : 'Couldn\'t check if the e-mail is available'});
        });
    }else{
        res.render('register', {error : 'All fields must be filled.'});
    }
});
//LOGIN
app.get('/login', (req,res)=>{
    res.render('login');
});
app.post('/login', (req,res)=>{
    const {email, password} = req.body;
    //getting user info from users table
    Query.dbGetUser(email).then(results =>{
        if(results.length!=0){
            let dbPassword = results[0].password;
            //user data to add to cookie session
            let user = {
                firstname : results[0].firstname,
                secondname : results[0].secondname,
                email : results[0].email,
                id : results[0].id
            };
            //checking password
            Password.checkPassword(password, dbPassword).then(matches =>{
                if(matches){
                    req.session.user = user;
                    Query.dbGetSignatureId(user.id).then(results=>{
                        if(results.length != 0){
                            req.session.signatureId = results[0].id;
                            res.redirect('/signed');
                        }else{
                            res.redirect('/petition');
                        }
                    }).catch(()=>{
                        res.render('login', {error : 'Something went wrong. Please try later.'});
                    });
                }else{
                    res.render('login', {error : 'Invalid password.'});
                    return;
                }
            }).catch(()=>{
                res.render('login', {error : 'Couldn\'t check password. Please try later.'});
            });
        }else{
            res.render('login', {error : 'E-mail doesn\'t exist in the database.'});
        }
    }).catch(()=>{
        res.render('login', {error : 'Error. Please try later.'});
    });
});
//PETITION
app.get('/petition', (req,res)=>{
    res.render('petition');
});
app.post('/petition', (req,res)=>{
    const {signature} = req.body;
    const userId = req.session.user.id;
    if(signature != ''){
        Query.dbSign(signature, userId).then(results=>{
            if(results.length != 0){
                req.session.signatureId = results[0].id;
                res.redirect('/signed');
            }else{
                res.render('petition', {error: 'Some problems occured, please contact the administrator'});
            }
        }).catch(err=>console.log(err));
    }else{
        res.render('petition', {error : 'Please sign the petition to continue.'});
    }
});
//SIGNED
app.get('/signed', (req, res)=>{
    Query.dbGetSignature(req.session.signatureId).then(signature=>{
        res.render('signed',{signature : signature, layout : 'layout'});
    }).catch(err=>console.log(err));
});
app.get('/unsign', (req,res)=>{
    Query.dbUnsign(req.session.signatureId).then(()=>{
        req.session.signatureId = null;
        res.redirect('/petition');
    }).catch(err=>console.log(err));
});
app.get('/whosigned', (req,res)=>{
    Query.dbGetSigners().then(results=>{
        res.render('whosigned', {results: results, layout:'layout'});
    }).catch((err)=>{
        console.log(err);
    });
});
app.get('/whosigned/cities/:city', (req, res)=>{
    Query.dbGetSignersByCity(req.params).then(results=>{
        res.render('whosigned', {results: results, layout : 'layout'});
    }).catch(err=>console.log(err));
});

//PROFILE
app.get('/profile', (req,res)=>{
    //gettingg profile info
    Query.dbGetProfileInfo(req.session.user.id).then(results=>{
        if(results.length == 0){
            results = {
                age : null,
                city : null,
                homepage : null
            };
        }
        res.render('profile', {userInfo: req.session.user, profileInfo: results});
    }).catch(()=>{
        res.render('profile', {userInfo: req.session.user, error: 'Error while trying to get profile info.'});
    });
});
app.post('/profile', (req,res)=>{
    const userid = req.session.user.id;
    //get profile info as you will need them all the time
    let {age, city, homepage} = req.body;
    let profile = {
        age : age,
        city: city,
        homepage: homepage
    };
    for(let key in profile){
        if(profile[key] == ''){
            profile[key] = null;
        }
    }
    //check if other things in the profile has been changed
    function updateInfo(){
        return Query.dbUpdateProfileInfo(profile, userid).then(results=>{
            if(results.length == 0){
                Query.dbInsertProfileInfo(profile, userid).then(results=>{
                    if(results.length != 0){
                        res.render('profile', {userInfo: req.session.user, profileInfo: profile, message : 'Your profile has been updated.'});
                    }
                });
            }else{
                res.render('profile', {userInfo: req.session.user, profileInfo: profile, message : 'Your profile has been updated.'});
            }
        });
    }
    //check if user info was meant to be changed
    if(req.body.firstname){
        let {firstname,secondname,email,password} = req.body;
        if(firstname != '' && secondname != '' && email != '' && password != ''){
            Query.dbGetPasswordByUserId(userid).then(hashedPassword =>{
                Password.checkPassword(password, hashedPassword).then(matched=>{
                    if(matched){
                        Query.dbUpdateUserInfo(firstname, secondname, email, userid).then(()=>{
                            req.session.user.firstname = firstname;
                            req.session.user.secondname = secondname;
                            req.session.user.email = email;
                            updateInfo();
                        }).catch(()=>{
                            res.render('profile', {userInfo : req.session.user, profileInfo : profile, error: 'Something went wrong, please try later.'});
                        });
                    }else{
                        res.render('profile', {userInfo : req.session.user, profileInfo : profile, error: 'Invalid password.'});
                    }
                });
            });
        }else{
            res.render('profile', {userInfo : req.session.user, profileInfo : profile, error: 'Please fill all the required * fields.'});
        }
    }else{
        updateInfo();
    }
});

app.get('/changepass', (req,res)=>{
    res.render('changepass');
});
app.post('/changepass', (req,res)=>{
    //changing the password, requires the current password and a new one repeated twice
    let {password, newPassword, repeatPassword} = req.body;
    if(password != '' && newPassword != '' && repeatPassword != ''){
        Query.dbGetPasswordByUserId(req.session.user.id).then(hashedPassword=>{
            Password.checkPassword(password,hashedPassword).then(matches=>{
                if(matches){
                    if(newPassword == repeatPassword){
                        Password.hashPassword(newPassword).then(hash=>{
                            Query.dbUpdatePassword(hash, req.session.user.id).then(()=>{
                                res.render('changepass',{message: 'Your password has been changed.'});
                            });
                        });
                    }else{
                        res.render('changepass', {error : 'The passwords don\'t match.'});
                    }
                }else{
                    res.render('changepass', {error: 'Invalid password.'});
                }
            });
        });
    }else{
        res.render('changepass',{error:'Please fill all required fields'});
    }
});
app.get('/logout', (req,res)=>{
    req.session.user = null;
    req.session.signatureId = null;
    res.locals.user = false;
    res.render('logout');
});
app.get('/*', (req,res)=>{
    res.status(404);
    res.render('404');
});
app.listen(process.env.PORT || 8080, console.log('Listening...'));
