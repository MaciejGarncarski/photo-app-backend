import { FastifyReply, FastifyRequest } from 'fastify';

import {
  AddPostCommentInput,
  CommentLikeInput,
  DeletePostCommentInput,
  GetPostCommentsInput,
  GetPostCommentsQuery,
} from './post-comment.schema.js';
import { addComment, addCommentLike, deleteComment, deleteCommentLike, getComments } from './post-comment.service.js';

export const addPostCommentHandler = async (request: FastifyRequest<{ Body: AddPostCommentInput }>) => {
  const { data } = request.session;
  const { body } = request;

  const comment = await addComment(body.commentText, parseInt(request.body.postId), data.id);

  return { data: comment };
};

export const deletePostCommentHandler = async (
  request: FastifyRequest<{ Params: DeletePostCommentInput }>,
  reply: FastifyReply,
) => {
  const { commentId } = request.params;
  const { data } = request.session;

  const response = await deleteComment(parseInt(commentId), data.id);
  if (response === 'ok') {
    return reply.status(204).send();
  }

  return reply.badRequest('Cannot delete comment.');
};

export const getCommentsHandler = async (
  request: FastifyRequest<{ Params: GetPostCommentsInput; Querystring: GetPostCommentsQuery }>,
) => {
  const {
    query: { skip },
    params: { postId },
  } = request;
  const { data } = request.session;
  const commentsData = await getComments(parseInt(postId), parseInt(skip), data.id);
  return { data: commentsData };
};

export const addCommentLikeHandler = async (
  request: FastifyRequest<{ Params: CommentLikeInput }>,
  reply: FastifyReply,
) => {
  const { data } = request.session;
  const response = await addCommentLike(parseInt(request.params.commentId), data.id);

  if (response === 'ok') {
    return reply.status(204).send();
  }

  return reply.badRequest('Comment is already liked.');
};

export const deleteCommentLikeHandler = async (
  request: FastifyRequest<{ Params: CommentLikeInput }>,
  reply: FastifyReply,
) => {
  const { data } = request.session;
  await deleteCommentLike(parseInt(request.params.commentId), data.id);
  return reply.status(204).send();
};
