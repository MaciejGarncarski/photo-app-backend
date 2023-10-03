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
import { httpCodes } from '../../consts/httpStatus.js';
import { getServerSession } from '../../utils/getServerSession.js';

export const addPostCommentHandler = async (
  request: FastifyRequest<{ Body: AddPostCommentInput }>,
  reply: FastifyReply,
) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'unauthorized' });
  }

  const result = commentTextSchema.safeParse(request.body.commentText);

  if (!result.success) {
    return reply.code(httpCodes.BAD_REQUEST).send({ status: 'Cannot add comment' });
  }

  try {
    await addComment(result.data, parseInt(request.body.postId), sessionUser.id);
    return reply.code(httpCodes.SUCCESS).send({ status: 'created post comment' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const deletePostCommentHandler = async (
  request: FastifyRequest<{ Params: DeletePostCommentInput }>,
  reply: FastifyReply,
) => {
  const { sessionUser } = await getServerSession(request);
  const { commentId } = request.params;

  if (!sessionUser?.id) {
    return reply.code(httpCodes.UNAUTHORIZED).send({ status: 'unauthorized' });
  }

  try {
    const response = await deleteComment(parseInt(commentId), sessionUser.id);
    if (response === 'ok') {
      return reply.code(httpCodes.SUCCESS).send({ status: 'comment deleted' });
    }
    return reply.code(httpCodes.BAD_REQUEST).send({ status: 'cannot delete comment' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
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
  const { sessionUser } = await getServerSession(request);

  try {
    const commentsData = await getComments(parseInt(postId), parseInt(skip), sessionUser?.id);
    return reply.status(httpCodes.SUCCESS).send(commentsData);
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const addCommentLikeHandler = async (
  request: FastifyRequest<{ Params: CommentLikeInput }>,
  reply: FastifyReply,
) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.FORBIDDEN).send({ status: 'unauthorized' });
  }

  try {
    const response = await addCommentLike(parseInt(request.params.commentId), sessionUser.id);

    if (response === 'ok') {
      return reply.code(httpCodes.SUCCESS).send({ message: 'added' });
    }

    return reply.code(httpCodes.BAD_REQUEST).send({ message: 'already liked' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};

export const deleteCommentLikeHandler = async (
  request: FastifyRequest<{ Params: CommentLikeInput }>,
  reply: FastifyReply,
) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.FORBIDDEN).send({ status: 'unauthorized' });
  }

  try {
    await deleteCommentLike(parseInt(request.params.commentId), sessionUser.id);
    return reply.code(httpCodes.SUCCESS).send({ message: 'deleted' });
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};
