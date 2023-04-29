import { buildJsonSchemas } from 'fastify-zod';
import { z } from 'zod';

const addPostCommentInputSchema = z.object({
  commentText: z.string(),
  postId: z.string(),
});

export type AddPostCommentInput = z.infer<typeof addPostCommentInputSchema>;

const deletePostCommentInputSchema = z.object({
  commentId: z.string(),
});

export type DeletePostCommentInput = z.infer<typeof deletePostCommentInputSchema>;

const getPostCommentsInputSchema = z.object({
  postId: z.string(),
});

const getPostCommentsQuerySchema = z.object({
  skip: z.string(),
});

export type GetPostCommentsInput = z.infer<typeof getPostCommentsInputSchema>;
export type GetPostCommentsQuery = z.infer<typeof getPostCommentsQuerySchema>;

export const commentTextSchema = z.string().max(100, { message: 'Maximum characters exceeded.' });

const commentSchema = z.object({
  commentText: z.string().max(100, { message: 'Maximum characters exceeded.' }),
  createdAt: z.date(),
  likesCount: z.number(),
  isLiked: z.boolean(),
  postId: z.number(),
  commentId: z.number(),
  authorId: z.string(),
});

export type Comment = z.infer<typeof commentSchema>;

const commentResponseSchema = z.object({
  comments: z.array(commentSchema),
  commentsCount: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
});

export type CommentResponse = z.infer<typeof commentResponseSchema>;

const commentLikeInputSchema = z.object({
  commentId: z.string(),
});

export type CommentLikeInput = z.infer<typeof commentLikeInputSchema>;

export const { $ref, schemas: postCommentSchemas } = buildJsonSchemas(
  {
    addPostCommentInputSchema,
    deletePostCommentInputSchema,
    getPostCommentsInputSchema,
    getPostCommentsQuerySchema,
    commentResponseSchema,
    commentLikeInputSchema,
  },
  { $id: 'postCommentSchema' },
);
