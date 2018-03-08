const spicedPg = require('spiced-pg');
var dbUrl = process.env.DATABASE_URL || `postgres://${require('../config/database.json').user}:${require('../config/database.json').pass}@localhost:5432/petition`;

var db = spicedPg(dbUrl);

function dbRegisterUser({firstname, secondname, email}, passwordHash){
    return db.query(`INSERT INTO users (firstname, secondname, email, password) VALUES ($1, $2, $3, $4) RETURNING id`, [firstname, secondname, email, passwordHash]).then(data=>{
        return data.rows;
    });
}
function dbGetUser(email){
    return db.query(`SELECT * FROM users WHERE email = $1`, [email]).then(data=>{
        return data.rows;
    }).catch(()=>{
        return null;
    });
}
function dbGetPasswordByUserId(userid){
    return db.query(`SELECT password FROM users WHERE id = $1`, [userid]).then(data =>{
        return data.rows[0].password;
    });
}
function dbSign(signature, userId){
    return db.query(`INSERT INTO signature (signature, userId) VALUES ($1, $2) RETURNING id`, [signature, userId]).then(data=>{
        return data.rows;
    });
}
function dbGetSigners(){
    return db.query(`SELECT firstname, secondname, age, city, homepage
        FROM signature
        LEFT JOIN users
        ON users.id = signature.userid
        LEFT JOIN profiles
        ON profiles.userid = signature.userid`).then(data=>{
        return data.rows;
    }).catch(err => console.log(err));
}
function dbGetSignatureId(userId){
    return db.query(`SELECT id FROM signature WHERE userid = $1`, [userId]).then(data=>{
        return data.rows;
    });
}
function dbUnsign(signatureId){
    return db.query(`DELETE FROM signature WHERE id=$1`, [signatureId]);
}
function dbGetSignature(signature_id){
    return db.query(`SELECT signature FROM signature WHERE id = $1`, [signature_id]).then(data=>{
        return data.rows[0].signature;
    });
}
//function dbGetProfileId
function dbInsertProfileInfo({age, city, homepage}, userid){
    return db.query(`INSERT INTO profiles (age, city, homepage, userid) VALUES ($1, $2, $3, $4) RETURNING id`, [age, city, homepage, userid]).then(data=>{
        return data.rows;
    });
}
function dbUpdateProfileInfo({age,city,homepage}, userid){
    return db.query(`UPDATE profiles SET
                        age = $1,
                        city = $2,
                        homepage = $3
                        WHERE userid = $4
                        RETURNING id
        `, [age, city, homepage, userid]).then(data => {return data.rows;});
}
function dbGetProfileInfo(userid){
    return db.query(`SELECT age, city, homepage FROM profiles WHERE userid=$1`,[userid]).then(data=>{
        return data.rows;
    });
}
function dbGetSignersByCity({city}){
    return db.query(`SELECT firstname, secondname, age, city, homepage
        FROM profiles
        LEFT JOIN users
        ON users.id = profiles.userid
        WHERE profiles.city = $1`, [city]).then(data=>{
        return data.rows;
    });
}
function dbUpdateUserInfo(firstname, secondname, email, userid){
    return db.query(`UPDATE users SET
                        firstname = $1,
                        secondname = $2,
                        email = $3
                        WHERE id = $4
                        RETURNING id`, [firstname,secondname,email,userid]).then(data=>{
        return data.rows;}).catch((err)=>console.log(err));
}
function dbUpdatePassword(newHash, userid){
    return db.query(`UPDATE users SET password = $1 WHERE id=$2`, [newHash, userid]);
}
module.exports = {
    dbRegisterUser : dbRegisterUser,
    dbSign : dbSign,
    dbGetSigners : dbGetSigners,
    dbGetSignatureId : dbGetSignatureId,
    dbUnsign : dbUnsign,
    dbGetSignature: dbGetSignature,
    dbGetUser : dbGetUser,
    dbGetPasswordByUserId : dbGetPasswordByUserId,
    dbInsertProfileInfo : dbInsertProfileInfo,
    dbUpdateProfileInfo : dbUpdateProfileInfo,
    dbGetSignersByCity : dbGetSignersByCity,
    dbUpdateUserInfo : dbUpdateUserInfo,
    dbGetProfileInfo : dbGetProfileInfo,
    dbUpdatePassword : dbUpdatePassword
};
