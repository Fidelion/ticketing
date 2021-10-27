import express from 'express';
import jwt from 'jsonwebtoken';
import { currentUser } from '@ticketsnode/common';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
    // if(!req.currentUser) {
    //     res.send({currentUser: null});
    // } else {
    //     res.send({ currentUser: req.currentUser })
    // }
    res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };