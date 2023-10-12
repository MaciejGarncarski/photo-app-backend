import { Static, Type } from '@fastify/type-provider-typebox';

export const getHomepagePostsInputSchema = Type.Object({
  skip: Type.String(),
});

export const postDescriptionSchema = Type.String({ minLength: 1, maxLength: 100 });

export const postSchema = Type.Object({
  createdAt: Type.String(),
  id: Type.Number(),
  authorId: Type.String(),
});

const postImageSchema = Type.Object({
  id: Type.Number(),
  fileId: Type.String(),
  name: Type.String(),
  url: Type.String(),
  thumbnailUrl: Type.String(),
  width: Type.Number(),
  height: Type.Number(),
  size: Type.Number(),
});

export const postDetailsSchema = Type.Object({
  commentsCount: Type.Number(),
  likesCount: Type.Number(),
  images: Type.Array(postImageSchema),
  createdAt: Type.String(),
  description: postDescriptionSchema,
  id: Type.Number(),
  isLiked: Type.Boolean(),
  authorId: Type.String(),
});

export const postsResponseSchema = Type.Object({
  postsCount: Type.Number(),
  totalPages: Type.Number(),
  currentPage: Type.Number(),
  data: Type.Array(postSchema),
});

const createPostInputSchema = Type.Object({
  description: Type.String(),
});

export const deletePostInputSchema = Type.Object({
  postId: Type.String(),
});

export const postByIdInputSchema = Type.Object({
  postId: Type.String(),
});

export const postLikeInputSchema = Type.Object({
  postId: Type.String(),
});

export const editPostParamsSchema = Type.Object({
  postId: Type.String(),
});

export const editPostInputSchema = Type.Object({
  description: postDescriptionSchema,
});

export const getUserPostsParamsSchema = Type.Object({
  authorId: Type.String(),
});

export const getUserPostsQuerySchema = Type.Object({
  skip: Type.Number(),
});

export type PostLikeInputSchema = Static<typeof postLikeInputSchema>;
export type PostByIdInput = Static<typeof postByIdInputSchema>;
export type GetHomepagePostsInput = Static<typeof getHomepagePostsInputSchema>;
export type DeletePostInput = Static<typeof deletePostInputSchema>;
export type EditPostParams = Static<typeof editPostParamsSchema>;
export type EditPostInput = Static<typeof editPostInputSchema>;
export type GetUserPostsParamsInput = Static<typeof getUserPostsParamsSchema>;
export type GetUserPostsQueryInput = Static<typeof getUserPostsQuerySchema>;
export type CreatePostInput = Static<typeof createPostInputSchema>;
export type PostDetails = Static<typeof postDetailsSchema>;
export type PostsResponse = Static<typeof postsResponseSchema>;
export type GetUserPostsInput = GetUserPostsParamsInput & GetUserPostsQueryInput;
