import express, { Request, Response } from 'express';
import connectDB from "./config/db";
import passport from "./config/passport";
import session from "express-session";
import userRoutes from "./routes/userRoutes";
import authRoutes from "./routes/authRoutes";
import tourRoutes from "./routes/tourRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import attractionRoutes from './routes/attractionRoutes';

import dotenv from "dotenv";
import cors from 'cors';


dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// const corsOptions = {
//   origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Update with your Nuxt app URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials: true, // If you are using cookies or authentication headers
// };

// app.use(cors(corsOptions));

app.use(cors());

app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET || "mysecret",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());


app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.use("/users", userRoutes);
app.use("/auth", authRoutes);
app.use("/tours", tourRoutes);
app.use("/booking", bookingRoutes);
app.use("/attractions", attractionRoutes);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
  });
});

export default app;