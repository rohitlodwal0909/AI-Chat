
import { Router } from "express";

import {
  addDocument,
} from "../controllers/document.controller";

const router = Router();

router.post("/", addDocument);

export default router;

