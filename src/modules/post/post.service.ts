import { Post, Prisma } from "@prisma/client";
import { prisma } from "../../config/db";

const createPost = async(payload: Prisma.PostCreateInput): Promise<Post> => {
    console.log("Create Post!!", payload);
    const createdPost = await prisma.post.create({
        data: payload,
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    })
    return createdPost
}


const getAllPosts = async () => {
    const result = await prisma.post.findMany();
    return result;
};

const getPostById = async (id: number) => {
    const result = await prisma.post.findUnique({
        where: { id },
        include: { author: true },
    });

    return result;
};

const updatePost = async (id: number, data: Partial<any>) => {
    return prisma.post.update({ where: { id }, data });
};

const deletePost = async (id: number) => {
    return prisma.post.delete({ where: { id } });
};

export const PostService = {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost
}
