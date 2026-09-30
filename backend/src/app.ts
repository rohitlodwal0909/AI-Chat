import express from "express";
import cors from "cors";

import chatRoutes from "./routes/chat.routes";
import documentRoutes from "./routes/document.routes";
import pdfRoutes from "./routes/pdf.routes";


const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use("/api/pdf",pdfRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/documents", documentRoutes);

export default app;