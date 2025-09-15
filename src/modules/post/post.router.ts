import express from 'express';
import { PostController } from './post.controller';

const router = express.Router();

// all routes
router.post("/", PostController.createPost);

export const postRouter = router;
