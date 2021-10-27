import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import { errorHandler, NotFoundError, currentUser } from '@ticketsnode/common';
import { createTicketRouter } from './routes/new';
import { getAllTickets } from './routes/index'; 
import { showTicketRouter } from './routes/show';
import { updateTicketRouter } from './routes/update';

import cookieSession from 'cookie-session';


const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
}));

app.use(currentUser);

app.use(getAllTickets);
app.use(createTicketRouter);
app.use(showTicketRouter);
app.use(updateTicketRouter);

app.all('*', async(req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);


export { app };