import { Comment, CommentResponse } from './post-comment.schema';
import { db } from '../prisma/db';

export const addComment = async (commentText: string, postId: number, sessionUserId: string) => {
  await db.postComment.create({
    data: {
      post_id: postId,
      user_id: sessionUserId,
      comment_text: commentText,
    },
    select: {
      created_at: true,
      id: true,
    },
  });
};

export const deleteComment = async (commentId: number, sessionUserId: string) => {
  const comment = await db.postComment.findFirst({
    where: {
      id: commentId,
    },
  });

  if (sessionUserId !== comment?.user_id) {
    return;
  }

  await db.commentLike.deleteMany({
    where: {
      comment_id: commentId,
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
      CommentLike: { where: { user_id: sessionUserId } },
      _count: { select: { CommentLike: true } },
    },

    where: {
      post_id: postId,
    },

    orderBy: {
      id: 'desc',
    },
  });

  const commentsCount = await db.postComment.count({
    where: {
      post_id: postId,
    },
  });

  const transformedComments = comments.map(
    ({ comment_text, created_at, id, post_id, user_id, CommentLike, _count }) => {
      const comment: Comment = {
        commentText: comment_text,
        createdAt: created_at,
        commentId: id,
        postId: post_id,
        isLiked: Boolean(CommentLike.find((commentLike) => commentLike.user_id === sessionUserId)),
        likesCount: _count.CommentLike,
        authorId: user_id,
      };

      return comment;
    },
  );

  const maxPages = commentsCount / COMMENTS_PER_REQUEST;
  const roundedMaxPages = Math.round(maxPages);
  const totalPages = roundedMaxPages;

  const response: CommentResponse = {
    commentsCount,
    totalPages,
    currentPage: skip,
    comments: transformedComments,
  };

  return response;
};
