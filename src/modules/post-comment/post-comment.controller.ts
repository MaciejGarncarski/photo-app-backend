import { FastifyReply, FastifyRequest } from 'fastify';

import {
  AddPostCommentInput,
  CommentLikeInput,
  commentTextSchema,
  DeletePostCommentInput,
  GetPostCommentsInput,
  GetPostCommentsQuery,
} from './post-comment.schema.js';
import { addComment, addCommentLike, deleteComment, deleteCommentLike, getComments } from './post-comment.service.js';

export const addPostCommentHandler = async (
  request: FastifyRequest<{ Body: AddPostCommentInput }>,
  reply: FastifyReply,
) => {
  const { data } = request.session;
  const result = commentTextSchema.safeParse(request.body.commentText);

  if (!result.success) {
    return reply.badRequest('Cannot add comment.');
  }

  try {
    const comment = addComment(result.data, parseInt(request.body.postId), data.id);
    return { comment };
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const deletePostCommentHandler = async (
  request: FastifyRequest<{ Params: DeletePostCommentInput }>,
  reply: FastifyReply,
) => {
  const { commentId } = request.params;
  const { data } = request.session;

  try {
    const response = await deleteComment(parseInt(commentId), data.id);
    if (response === 'ok') {
      return reply.status(204).send();
    }

    return reply.badRequest('Cannot delete comment.');
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const getCommentsHandler = async (
  request: FastifyRequest<{ Params: GetPostCommentsInput; Querystring: GetPostCommentsQuery }>,
  reply: FastifyReply,
) => {
  const {
    query: { skip },
    params: { postId },
  } = request;
  const { data } = request.session;
  try {
    const commentsData = await getComments(parseInt(postId), parseInt(skip), data.id);
    return commentsData;
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const addCommentLikeHandler = async (
  request: FastifyRequest<{ Params: CommentLikeInput }>,
  reply: FastifyReply,
) => {
  const { data } = request.session;
  try {
    const response = await addCommentLike(parseInt(request.params.commentId), data.id);

    if (response === 'ok') {
      return reply.status(204).send();
    }

    return reply.badRequest('Comment is already liked.');
  } catch (error) {
    return reply.internalServerError(error as string);
  }
};

export const deleteCommentLikeHandler = async (
  request: FastifyRequest<{ Params: CommentLikeInput }>,
  reply: FastifyReply,
) => {
  const { data } = request.session;
  await deleteCommentLike(parseInt(request.params.commentId), data.id);
  return reply.status(204).send();
};
