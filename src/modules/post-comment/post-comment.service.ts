import { Comment, CommentResponse } from './post-comment.schema.js';
import { db } from '../../utils/db.js';

export const addComment = async (commentText: string, postId: number, sessionUserId: string) => {
  const data = await db.postComment.create({
    data: {
      postId,
      userId: sessionUserId,
      text: commentText,
    },
  });

  return data;
};

export const deleteComment = async (commentId: number, sessionUserId: string) => {
  const comment = await db.postComment.findFirst({
    where: {
      id: commentId,
    },
  });

  if (sessionUserId !== comment?.userId) {
    return;
  }

  await db.commentLike.deleteMany({
    where: {
      commentId,
    },
  });

  await db.postComment.deleteMany({
    where: {
      id: commentId,
    },
  });

  return 'ok';
};

const COMMENTS_PER_REQUEST = 4;

export const getComments = async (postId: number, skip: number, sessionUserId?: string) => {
  const comments = await db.postComment.findMany({
    skip: skip * COMMENTS_PER_REQUEST,
    take: COMMENTS_PER_REQUEST,

    include: {
      commentLike: { where: { userId: sessionUserId } },
      _count: { select: { commentLike: true } },
    },

    where: {
      postId,
    },

    orderBy: {
      id: 'desc',
    },
  });

  const commentsCount = await db.postComment.count({
    where: {
      postId,
    },
  });

  const transformedComments = comments.map(({ text, createdAt, id, postId, userId, commentLike, _count }) => {
    const comment: Comment = {
      text,
      createdAt: createdAt.toString(),
      commentId: id,
      postId: postId,
      isLiked: Boolean(commentLike.find((commentLike) => commentLike.userId === sessionUserId)),
      likesCount: _count.commentLike,
      authorId: userId,
    };

    return comment;
  });

  const maxPages = commentsCount / COMMENTS_PER_REQUEST;
  const totalPages = Math.ceil(maxPages) - 1;

  const response: CommentResponse = {
    commentsCount,
    totalPages,
    currentPage: skip,
    comments: transformedComments,
  };

  return response;
};

export const addCommentLike = async (commentId: number, sessionUserId: string) => {
  const isAlreadyLiked = await db.commentLike.findFirst({
    where: {
      commentId: commentId,
      userId: sessionUserId,
    },
  });

  if (isAlreadyLiked) {
    return null;
  }

  await db.commentLike.create({
    data: {
      commentId: commentId,
      userId: sessionUserId,
    },
  });

  return 'ok';
};

export const deleteCommentLike = async (commentId: number, sessionUserId: string) => {
  await db.commentLike.deleteMany({
    where: {
      commentId: commentId,
      userId: sessionUserId,
    },
  });
};
