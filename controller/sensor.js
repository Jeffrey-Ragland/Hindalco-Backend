import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import loginModel from '../models/loginModel.js';


// http://localhost:4000/backend/hindalcoSignup?Username=[username]&Password=[password]
export const signup = (req, res) => {
    const {Username, Password} = req.query;
    bcrypt.hash(Password, 10)
    .then(hash => {
        loginModel.create({Username, Password: hash})
        .then(info => res.json(info))
        .catch(err => res.json(err))
    })
    .catch(error => console.log(error));
};

export const login = (req,res) => {
    const {Username, Password} = req.body;
    loginModel.findOne({Username})
    .then(user => {
        if(user) {
            bcrypt.compare(Password, user.Password, (err, response) => {
                if(response) {
                    const redirectUrl = '/dashboard';
                    const token = jwt.sign({Username: user.Username}, 'jwt-secret-key-123', {expiresIn: '1d'});
                    res.json({token, redirectUrl});
                } else {
                    res.status(401).json({ message: "Incorrect password" });
                };
            });
        };
    })
    .catch(error => {
        console.log(error);
        res.status(500).json({ message: "Server error" });
});
};