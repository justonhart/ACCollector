const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

module.exports = function(){


    this.initialize = function(passport, findUser){
        const authenticateUser = async (username, password, done) => {
            
            try {
                let account = await findUser(username);
                if(account == null)
                    return done(null, false, {message: 'Entered username does not exist'});
                if(await bcrypt.compare(password, account.password)){
                    return done(null, account);
                }
                else{
                    return done(null, false, {message: 'Password incorrect'});
                }
            } catch (error) {
                return done(error);
            }
        };
        passport.use(new LocalStrategy( {usernameField: 'username'}, authenticateUser));
        passport.serializeUser(function(user, done){done(null, user.user_name)});
        passport.deserializeUser( async (username, done) => {
            let user = await findUser(username);
            return done(null, user);
        });
    }
};




 