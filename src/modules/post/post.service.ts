import { Post, Prisma } from "@prisma/client";
import { prisma } from "../../config/db";

const createPost = async (payload: Prisma.PostCreateInput): Promise<Post> => {
  console.log("Create Post!!", payload);
  const createdPost = await prisma.post.create({
    data: payload,
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
  return createdPost;
};

const getAllPosts = async ({
  page = 1,
  limit = 10,
  search,
  isFeatured,
  tags,
}: {
  page?: number;
  limit?: number;
  search?: string;
  isFeatured?: boolean;
  tags?: string[];
}) => {
  const skip = (page - 1) * limit;
  const where: any = {
    AND: [
      search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      },
      typeof isFeatured === "boolean" && { isFeatured },
      // to find in array: hasEvery (prisma)
      tags && tags?.length > 0 && { tags: { hasEvery: tags } },
    ].filter(Boolean),
  };

  const result = await prisma.post.findMany({
    skip,
    take: limit,
    where,
  });

  const total = await prisma.post.count({ where });
  return {
    data: result,
    pagination: {
      page,
      limit,
      total: total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getPostById = async (id: number) => {
  const result = await prisma.$transaction(async (tnx) => {
    await tnx.post.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const postData = await tnx.post.findUnique({
      where: { id },
      include: { author: true },
    });

    return postData
  });

  return result;
};

const updatePost = async (id: number, data: Partial<any>) => {
  return prisma.post.update({ where: { id }, data });
};

const deletePost = async (id: number) => {
  return prisma.post.delete({ where: { id } });
};

const getBlogStat = async () => {
  return await prisma.$transaction(async(tnx) => {
    const aggregates = await tnx.post.aggregate({
      _count: true,
      _sum: {views: true},
      _avg: {views: true},
      _max: {views: true},
      _min: {views: true}
    })

    const featuredCount = await tnx.post.count({
      where: {
        isFeatured: true
      }
    })

    const topFeatured = await tnx.post.findFirst({
      where: {isFeatured: true},
      orderBy: {views: "desc"}
    })

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7)

    const lastWeekPostCount = await tnx.post.count({
      where: {
        createdAt: {
          gte: lastWeek
        }
      }
    })

    return {
      stats: {
        totalPosts: aggregates._count ?? 0,
        totalViews: aggregates._sum.views ?? 0,
        avgViews: aggregates._avg.views ?? 0,
        minViews: aggregates._min.views ?? 0,
        maxViews: aggregates._max.views ?? 0
      },
      featured: {
        count: featuredCount,
        topPost: topFeatured
      },
      lastWeekPostCount
    }
  })
}

export const PostService = {
  createPost,
  getAllPosts,
  getPostById,
  updatePost,
  deletePost,
  getBlogStat
};
