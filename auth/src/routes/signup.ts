import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest } from '@ticketsnode/common';
import { BadRequestError } from '@ticketsnode/common';
import { User } from '../models/user';

const router = express.Router();

router.post('/api/users/signup', [
    body('email')
        .isEmail()
        .withMessage('Enter valid email'),
    body('password')
        .trim()
        .isLength({ min:4, max: 20})
        .withMessage('Password must be between 4 and 20 characters')
], validateRequest, async (req: Request, res: Response) => {

    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if(existingUser) {
        throw new BadRequestError('This email is already in use');
    }

    const user = User.build({
        email,
        password
    });

    await user.save();

    //Generate JWT
    const userJwt = jwt.sign({
        id: user.id,
        email: user.email
    }, process.env.JWT_KEY!);

    //Assign JWT to cookie
    req.session = {
        jwt: userJwt
    };

    res.status(201).send(user);
});

export { router as signupRoute };