import { PostImage } from '@prisma/client';
import { buildJsonSchemas } from 'fastify-zod';
import { z } from 'zod';

const getHomepagePostsInputSchema = z.object({
  skip: z.string(),
});

export type GetHomepagePostsInput = z.infer<typeof getHomepagePostsInputSchema>;

export const postDescriptionSchema = z.string().min(1).max(100);

export const postSchema = z.object({
  commentsCount: z.number(),
  likesCount: z.number(),
  images: z.array(z.custom<PostImage>()),
  createdAt: z.date(),
  description: postDescriptionSchema,
  id: z.number(),
  isLiked: z.boolean(),
  authorId: z.string(),
});

export const postsResponseSchema = z.object({
  postsCount: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  posts: z.array(postSchema),
});

export type Post = z.infer<typeof postSchema>;
export type PostsResponse = z.infer<typeof postsResponseSchema>;

const createPostInputSchema = z.object({
  description: z.string(),
});

export type CreatePostInput = z.infer<typeof createPostInputSchema>;

const deletePostInputSchema = z.object({
  postId: z.string(),
});
export type DeletePostInput = z.infer<typeof deletePostInputSchema>;

const postByIdInputSchema = z.object({
  postId: z.string(),
});

export type PostByIdInput = z.infer<typeof postByIdInputSchema>;

const postLikeInputSchema = z.object({
  postId: z.string(),
});

export type PostLikeInputSchema = z.infer<typeof postLikeInputSchema>;

const editPostInputSchema = z.object({
  description: postDescriptionSchema,
  postId: z.string(),
});

export type EditPostInput = z.infer<typeof editPostInputSchema>;

export const { schemas: postSchemas, $ref } = buildJsonSchemas(
  {
    postsResponseSchema,
    getHomepagePostsInputSchema,
    createPostInputSchema,
    deletePostInputSchema,
    postByIdInputSchema,
    postSchema,
    editPostInputSchema,
  },
  { $id: 'postSchema' },
);
