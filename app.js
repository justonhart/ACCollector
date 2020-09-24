const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const cookieSession = require('cookie-session');
const methodOverride = require('method-override');
const path= require('path');
require('dotenv').config();
require('./passport-config')();
const bodyParser = require('body-parser');

initialize(passport, queryUser);

const PORT = process.env.PORT || 3000;

const db_info = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
};

let db = mysql.createConnection(db_info);

db.on('error', function(err, res){
    if(err.code === "PROTOCOL_CONNECTION_LOST"){
        handleDatabaseDiscconection();
    }
});

const app = express();

app.set('view-engine', 'ejs');

app.use(express.static('assets'));
app.use(express.urlencoded({extended:false}));
app.use(flash());
app.use(cookieSession({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false//,
    //maxAge: 1000 * 60 * 60
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());


app.listen(PORT, ()=>{
    console.log(`Server started on port ${PORT}`);
});

app.get('/', checkNotAuthenticated, (req, res) =>{
    res.render('index.ejs');
});

app.get('/register', checkNotAuthenticated, (req, res) =>{
    res.render('register.ejs');
});

app.get('/register-new', checkNotAuthenticated, (req, res) =>{
    res.render('register-new.ejs');
});

app.get('/register-join', checkNotAuthenticated, (req, res) =>{
    res.render('register-join.ejs');
});

app.get('/login', checkNotAuthenticated, (req, res) =>{
    res.render('login.ejs');
});

app.get('/dashboard',checkAuthenticated, (req, res) =>{
    res.render('dashboard.ejs', {user_name: req.user.user_name});
});

app.get('/friends', noCache, checkAuthenticated, async (req,res) => {
    try{
        let rows = await queryFriends(req.user.user_name);
        let names = [];
        for(let i = 0; i < rows.length; i++){
            if(rows[i].user_name_1 == req.user.user_name) names.push(rows[i].user_name_2);
            else names.push(rows[i].user_name_1);
        }
        res.render('friends.ejs', {friends : names});
        
    }catch(error){
        console.log(error);
        res.redirect('/dashboard');
    }
});

app.get('/collection', noCache, checkAuthenticated, async (req,res) => {
    try{

        if(!req.query.user || !(await queryUser(req.query.user))){
            res.redirect('/dashboard');
            return;
        }

        //if this is the user's collction, provide a full list of items w/ owned highlighted
        if(req.user.user_name === req.query.user){

            //get the user's collection
            let userCollection = await ((username) => {
                return new Promise((resolve, reject) => {
                    const sql = `SELECT u.item_name, item_type FROM player_collections u INNER JOIN player_collectibles i ON u.item_name = i.item_name AND (u.user_name = '${req.query.user}') UNION SELECT u.item_name, item_type FROM island_collections u INNER JOIN island_collectibles i ON u.item_name = i.item_name AND u.island_id = (SELECT island_id from users where user_name = '${req.query.user}');`;
                    db.query(sql, (err, res) => {
                        return err ? reject(err) : resolve(res);
                    });
                });
            })(req.query.user);

            //get the full list
            let fullCollection = await (() => {
                return new Promise((resolve, reject) => {
                    const sql = `SELECT item_name, item_type FROM player_collectibles UNION SELECT item_name, item_type FROM island_collectibles;`;
                    db.query(sql, (err, res) => {
                        return err ? reject(err) : resolve(res);
                    });
                });
            })();

            //mark the songs in the full collection that the user already has
            for(item of fullCollection){
                for(userItem of userCollection){
                    if(userItem.item_name === item.item_name){
                        item.owned = true;
                    }
                }
            }

            res.render('collection.ejs', {canEdit: true, collection: fullCollection, username: req.query.user});

        }

        //otherwise, show the items needed by other user + the songs you can order for them
        else{

            //get their collection(songs + fossils)
            let theirCollection = await ((username) => {
                return new Promise((resolve, reject) => {
                    const sql = `SELECT u.item_name, item_type FROM player_collections u INNER JOIN player_collectibles i ON u.item_name = i.item_name AND (u.user_name = '${req.query.user}') UNION SELECT u.item_name, item_type FROM island_collections u INNER JOIN island_collectibles i ON u.item_name = i.item_name AND u.island_id = (SELECT island_id from users where user_name = '${req.query.user}');`;
                    db.query(sql, (err, res) => {
                        return err ? reject(err) : resolve(res);
                    });
                });
            })(req.query.user);

            let fullCollection = await (() => {
                return new Promise((resolve, reject) => {
                    const sql = `SELECT item_name, item_type FROM player_collectibles UNION SELECT item_name, item_type FROM island_collectibles;`;
                    db.query(sql, (err, res) => {
                        return err ? reject(err) : resolve(res);
                    });
                });
            })();

            let theirNeeds = fullCollection.filter(item => {for(i of theirCollection){if (JSON.stringify(i) === JSON.stringify(item)) return false;} return true;});

            //get the active user's songs to compare to the other collection
            let userSongs = await ((username) => {
                return new Promise((resolve, reject) => {
                    const sql = `SELECT u.item_name, item_type FROM player_collections u INNER JOIN player_collectibles i ON u.item_name = i.item_name AND user_name = '${username}';`;
                    db.query(sql, (err, res) => {
                        return err ? reject(err) : resolve(res);
                    });
                });
            })(req.user.user_name);



            for(item of theirNeeds){
                for(song of userSongs){
                    if(song.item_name === item.item_name){
                        item.canProvide = true;
                    }
                }
            }
            //provide the list of needed songs to the webpage
            res.render('collection.ejs', {canEdit: false, needs: theirNeeds, username: req.query.user});
        }
            
    }catch(error){
        console.log(error);
        res.redirect('/dashboard');
    }
});

app.post('/register-new', checkNotAuthenticated, async (req, res)=>{
    try {

        if(!meetsPasswordRequirements(req.body.password)){
            req.flash('error', 'Invalid Password');
            return res.redirect('/register-new');
        }

        if(!meetsUsernameRequirements(req.body.username)){
            req.flash('error', 'Invalid Username');
            return res.redirect('/register-new');
        }

        if(!meetsCharNameRequirements(req.body.charname)){
            req.flash('error', 'Invalid Character Name');
            return res.redirect('/register-new');
        }

        if(!meetsIslandNameRequirements(req.body.islandname)){
            req.flash('error', 'Invalid Island Name');
            return res.redirect('/register-new');
        }

        let hashedPassword = await(bcrypt.hash(req.body.password,10));
        let islandId;

        if(await queryUser(req.body.username)){
            req.flash('error', 'Username already in use');
            return res.redirect('/register-new');
        }

        db.query(`INSERT INTO islands(island_name) VALUES('${req.body.islandname}')`, (err,query1res) => {
            if(err) throw err;
            db.query(`INSERT INTO users(user_name, password, char_name, island_id) VALUES('${req.body.username}','${hashedPassword}','${req.body.charname}',${query1res.insertId})`, (err,query2res) =>{
                if(err) throw err;
                res.redirect('/login');
            });
        });
    } catch (error) {
        res.redirect('/register-new');
    }
});

app.post('/register-join', checkNotAuthenticated, async (req, res) => {
    try {

        if(!meetsPasswordRequirements(req.body.password)){
            req.flash('error', 'Invalid Password');
            return res.redirect('/register-join');
        }

        if(!meetsUsernameRequirements(req.body.username)){
            req.flash('error', 'Invalid Username');
            return res.redirect('/register-join');
        }

        if(!meetsCharNameRequirements(req.body.charname)){
            req.flash('error', 'Invalid Character Name');
            return res.redirect('/register-join');
        }


        let hashedPassword = await(bcrypt.hash(req.body.password,10));
        if(await queryUser(req.body.username)){
            req.flash('error', 'User does not exist');
            return res.redirect('/register-join');
        }

        let otherUser = await queryUser(req.body.otheruser);
        if(otherUser && await bcrypt.compare(req.body.otherpass, otherUser.password)){
            db.query(`INSERT INTO users(user_name, password, char_name, island_id) VALUES('${req.body.username}','${hashedPassword}','${req.body.charname}',${otherUser.island_id})`);
            addUserRelationship(req.body.username, otherUser.user_name);
            res.redirect('/login');
        }else{
            req.flash('error', 'User password incorrect');
            res.redirect('/register-join');
        }
    } catch (error) {
        res.redirect('/register-join');
    }
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local',  {
    successRedirect: '/dashboard', 
    failureRedirect: '/login',
    failureFlash: true
}));

app.post('/collection', checkAuthenticated, async(req, res) => {
    
    let islandAdditions = req.body.changes.islandAdditions;
    let playerAdditions = req.body.changes.playerAdditions;
    let islandRemovals = req.body.changes.islandRemovals;
    let playerRemovals = req.body.changes.playerRemovals;

    if(islandAdditions.length){
        insertIntoCollection(req.user.island_id, islandAdditions, "island_collections");
    }
        
    if(playerAdditions.length){
        insertIntoCollection(req.user.user_name, playerAdditions, "player_collections");
    } 
        
    if(islandRemovals.length){
        removeFromCollection(req.user.island_id, islandRemovals, "island_collections");
    }
    
    if(playerRemovals.length){
        removeFromCollection(req.user.user_name, playerRemovals, "player_collections");
    }
    

    res.sendStatus(200);
});

app.post('/friends/add', checkAuthenticated, async (req, res) => {
    if(req.user.user_name != req.body.addUsername && await queryUser(req.body.addUsername)){
        addUserRelationship(req.user.user_name, req.body.addUsername);
    }
    res.redirect('/friends');
});

app.delete('/logout', checkAuthenticated, (req,res) =>{
    req.logOut();
    res.redirect('/');
});

function queryUser(username){
    return new Promise((resolve,reject) => {
        const sql = `SELECT * FROM users WHERE UPPER(user_name) = UPPER('${username}')`;
        db.query(sql, (err, results) => {
            return err ? reject(err) : resolve(results[0]);
        });
    });  
}

function queryFriends(username){
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM user_relationships WHERE (user_name_1 = '${username}' OR user_name_2 = '${username}')`;
        db.query(sql, (err, results) => {
            return err ? reject(err) : resolve(results); 
        });
    });
}

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()) return next();
    res.redirect('/login');
}

function checkNotAuthenticated(req, res, next){
    if(!req.isAuthenticated()) return next();
    res.redirect('/dashboard');
}

function insertIntoCollection(id, additions, table){
    
    
    let tableKey = (table === 'player_collections' ? 'user_name' : 'island_id');
    let sql = `INSERT INTO ${table}(${tableKey}, item_name) VALUES `;
    additions.forEach(item => {
        sql += `('${id}', '${parseItemForSQL(item.item_name)}'),`;
    });
    
    //slice to remove the comma tail
    db.query(sql.slice(0,sql.length -1), (err, res) => {
        return (err? err : res);
    });
}

function removeFromCollection(id, removals, table){
    
    let tableKey = (table === 'player_collections' ? 'user_name' : 'island_id');

    let values = "";
    removals.forEach(item => {
        values += `('${id}', '${parseItemForSQL(item.item_name)}'),`;
    });

    //remove the comma tail
    values = values.slice(0,values.length-1);
    let sql = `DELETE FROM ${table} WHERE (${tableKey}, item_name) IN (${values})`;
    db.query(sql, (err, res) => {
        return (err? err : res);
    });
}

function addUserRelationship(user1, user2){
    let smaller = (user1.toUpperCase() < user2.toUpperCase()) ? user1 : user2;
    let larger = (user1.toUpperCase() > user2.toUpperCase()) ? user1 : user2;
    console.log(`adding user relationship between ${smaller} and ${larger}`);
    let sql = `INSERT INTO user_relationships(user_name_1, user_name_2) VALUES((SELECT user_name from users WHERE UPPER(user_name) = UPPER('${smaller}')), (SELECT user_name from users WHERE UPPER(user_name) = UPPER('${larger}')))`;
    db.query(sql);
}

function handleDatabaseDiscconection(){
    db = mysql.createConnection(db_info);
    db.on('error', function(err, res){
        if(err.code === "PROTOCOL_CONNECTION_LOST"){
            handleDatabaseDiscconection();
        }
    });
}

function noCache(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next()
}

function meetsPasswordRequirements(pass) {
    if(pass.length < 6 || pass.length > 50){
        return false;
    }
    return true;
}

function  meetsUsernameRequirements(name){
    let acceptedChars = /^[a-z0-9]+$/i;

    if(name.length < 3 || name.length > 16 || !name.match(acceptedChars)){
        return false;
    }

    return true;
}

function  meetsCharNameRequirements(name){
    let acceptedChars = /^[a-z0-9]+$/i;

    if(name.length < 1 || name.length > 16 || !name.match(acceptedChars)){
        return false;
    }

    return true;
}

function  meetsIslandNameRequirements(name){
    let acceptedChars = /^[a-z0-9\s]+$/i;

    if(name.length < 1 || name.length > 10 || !name.match(acceptedChars)){
        return false;
    }

    return true;
}

function parseItemForSQL(item){
    return item.replace("\'", "\\\'");
}