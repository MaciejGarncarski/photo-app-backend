import { FastifyReply, FastifyRequest } from 'fastify';

import {
  AddPostCommentInput,
  CommentLikeInput,
  commentTextSchema,
  DeletePostCommentInput,
  GetPostCommentsInput,
  GetPostCommentsQuery,
} from './post-comment.schema';
import { addComment, addCommentLike, deleteComment, deleteCommentLike, getComments } from './post-comment.service';
import { httpCodes } from '../consts/httpStatus';
import { getServerSession } from '../utils/getServerSession';

export const addPostCommentHandler = async (
  request: FastifyRequest<{ Body: AddPostCommentInput }>,
  reply: FastifyReply,
) => {
  const { sessionUser } = await getServerSession(request);

  if (!sessionUser?.id) {
    return reply.code(httpCodes.UNAUTHORIZED).send('unauthorized');
  }

  const result = commentTextSchema.safeParse(request.body.commentText);

  if (!result.success) {
    return reply.code(httpCodes.BAD_REQUEST).send('Cannot add comment');
  }

  try {
    await addComment(result.data, parseInt(request.body.postId), sessionUser.id);
    return reply.code(httpCodes.SUCCESS).send('created post comment');
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
    return reply.code(httpCodes.UNAUTHORIZED).send('unauthorized');
  }

  try {
    const response = await deleteComment(parseInt(commentId), sessionUser.id);
    if (response === 'ok') {
      return reply.code(httpCodes.SUCCESS).send('comment deleted');
    }
    return reply.code(httpCodes.BAD_REQUEST).send('cannot delete comment');
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
    return reply.code(httpCodes.FORBIDDEN).send('unauthorized');
  }

  try {
    const response = await addCommentLike(parseInt(request.params.commentId), sessionUser.id);

    if (response === 'ok') {
      return reply.code(httpCodes.SUCCESS).send('comment like added');
    }

    return reply.code(httpCodes.BAD_REQUEST).send('comment is already liked');
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
    return reply.code(httpCodes.FORBIDDEN).send('unauthorized');
  }

  try {
    await deleteCommentLike(parseInt(request.params.commentId), sessionUser.id);
    return reply.code(httpCodes.SUCCESS).send('comment like deleted');
  } catch (error) {
    return reply.code(httpCodes.SERVER_ERROR).send(error);
  }
};
