import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';

import cookieSession from 'cookie-session';
import { currentUserRouter } from './routes/current-user';
import { signinRoute } from './routes/signin';
import { signoutRoute } from './routes/signout';
import { signupRoute } from './routes/signup';
import { errorHandler } from '@ticketsnode/common';
import { NotFoundError } from '@ticketsnode/common';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}));
app.use(currentUserRouter);
app.use(signinRoute);
app.use(signoutRoute);
app.use(signupRoute);

app.all('*', async(req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);


export { app };