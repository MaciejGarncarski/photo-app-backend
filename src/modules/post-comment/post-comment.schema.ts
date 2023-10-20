import { Static, Type } from '@fastify/type-provider-typebox';

export const addPostCommentInputSchema = Type.Object({
  commentText: Type.String(),
  postId: Type.String(),
});

export const deletePostCommentInputSchema = Type.Object({
  commentId: Type.String(),
});

export const getPostCommentsInputSchema = Type.Object({
  postId: Type.String(),
});

export const getPostCommentsQuerySchema = Type.Object({
  skip: Type.String(),
});

export const commentTextSchema = Type.String({ maxLength: 100 });

export const addCommentResponseScema = Type.Object({
  id: Type.Number(),
  userId: Type.String(),
  postId: Type.Number(),
  createdAt: Type.String(),
  text: Type.String(),
});

export const commentSchema = Type.Object({
  text: commentTextSchema,
  createdAt: Type.String(),
  likesCount: Type.Number(),
  isLiked: Type.Boolean(),
  postId: Type.Number(),
  commentId: Type.Number(),
  authorId: Type.String(),
});

export const commentResponseSchema = Type.Object({
  comments: Type.Array(commentSchema),
  commentsCount: Type.Number(),
  totalPages: Type.Number(),
  currentPage: Type.Number(),
});

export const commentLikeInputSchema = Type.Object({
  commentId: Type.String(),
});

export type Comment = Static<typeof commentSchema>;
export type CommentResponse = Static<typeof commentResponseSchema>;
export type CommentLikeInput = Static<typeof commentLikeInputSchema>;
export type GetPostCommentsInput = Static<typeof getPostCommentsInputSchema>;
export type GetPostCommentsQuery = Static<typeof getPostCommentsQuerySchema>;
export type AddPostCommentInput = Static<typeof addPostCommentInputSchema>;
export type DeletePostCommentInput = Static<typeof deletePostCommentInputSchema>;
