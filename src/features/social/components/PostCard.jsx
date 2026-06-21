import React from 'react';
import { 
  AlertTriangle, EyeOff, Eye, MapPin, ThumbsUp, ThumbsDown, MessageSquare,
  MoreHorizontal, Trash2, Share2, CornerDownRight, X, Send
} from 'lucide-react';

export default function PostCard({
  post,
  idx,
  currentUser,
  language,
  t,
  openCommentsPostId,
  setOpenCommentsPostId,
  commentInputs,
  setCommentInputs,
  replyInputs,
  setReplyInputs,
  activeReplyBoxId,
  setActiveReplyBoxId,
  activeDropdownPostId,
  setActiveDropdownPostId,
  sharedPostId,
  activeHashtagFilter,
  setActiveHashtagFilter,
  handleLike,
  handleDislike,
  handleReportPost,
  handleDeletePost,
  handleToggleHidePost,
  handleShareLink,
  handleAddComment,
  handleAddReply,
  handleDeleteComment
}) {
  return (
    <article
      className={`bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col p-4 sm:p-5 gap-4 shadow-sm hover:shadow-md hover:border-heritage-gold/30 transition-all duration-300 group shimmer-trigger animate-fade-in-up`}
      style={{ animationDelay: `${(idx + 1) * 150}ms` }}
    >
      {/* Post Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 relative z-10">
        <div className="flex gap-3">
          <img
            src={post.user.avatar}
            alt={post.user.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-100 group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-outfit text-sm font-bold text-gray-900 group-hover:text-heritage-amber transition-colors">{post.user.name}</span>
              <span className="text-[9px] bg-ricefield-green/10 text-ricefield-green font-extrabold px-2 py-0.5 rounded-full border border-ricefield-green/20">
                {post.user.badge[language]}
              </span>
            </div>
            <span className="text-[10px] text-gray-400">{post.date[language]}</span>
          </div>
        </div>

        {/* Visual Category Badge pill */}
        <div className="flex items-center gap-1.5 flex-wrap sm:justify-end">
          <span className={`text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider border leading-none ${post.category === 'food'
            ? 'bg-blue-50 text-blue-600 border-blue-200'
            : post.category === 'adventure'
              ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
              : post.category === 'scenic'
                ? 'bg-sky-50 text-sky-600 border-sky-200'
                : 'bg-green-50 text-ricefield-green border-ricefield-green/20'
            }`}>
            {post.category === 'food'
              ? t('tagFood')
              : post.category === 'adventure'
                ? t('tagAdventure')
                : post.category === 'scenic'
                  ? t('tagScenic')
                  : t('tagHealing')
            }
          </span>
        </div>
      </div>

      {post.reported && (
        <div className="bg-red-50 border border-red-250 text-red-600 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-pulse relative z-10 select-none">
          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span>{language === 'vi' ? 'Bài viết này đã bị báo cáo đến admin!' : 'This post has been reported to admin!'}</span>
        </div>
      )}

      {post.status === 'hidden' && (
        <div className="bg-gray-50 border border-gray-200 text-gray-500 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 relative z-10 select-none">
          <EyeOff className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span>{language === 'vi' ? 'Bài viết này đang bị ẩn đối với cộng đồng.' : 'This post is currently hidden from the community.'}</span>
        </div>
      )}

      {/* Content body text */}
      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line font-medium relative z-10">
        {post.content[language]}
      </p>

      {/* Optional Linked Spot Details */}
      {post.spot && (
        <div className="flex flex-col gap-1.5 bg-gradient-to-r from-gray-50 to-blue-50/20 border border-gray-150 p-3 rounded-xl text-[11.5px] font-bold text-gray-700 shadow-sm relative z-10 select-none">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-heritage-amber animate-pulse" />
            <span className="text-gray-400">{language === 'vi' ? 'Địa điểm' : 'Place'}:</span>
            <span className="text-heritage-amber font-extrabold">{post.spot.name}</span>
          </div>
          <div className="text-[10px] text-gray-500 pl-5 font-semibold">
            📍 {post.spot.address}
          </div>
        </div>
      )}

      {/* Clickable Hashtags */}
      {post.hashtags && post.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 relative z-10 select-none">
          {post.hashtags.map((tag, tIdx) => (
            <button
              key={tIdx}
              onClick={(e) => {
                e.stopPropagation();
                setActiveHashtagFilter(tag);
              }}
              className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                activeHashtagFilter === tag
                  ? 'bg-heritage-amber text-white border-heritage-amber shadow-sm shadow-heritage-amber/20 scale-105'
                  : 'bg-white text-heritage-amber border-heritage-amber/35 hover:border-heritage-amber'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}


      {/* Images attachments */}
      {post.images && post.images.length > 0 && (
        <div className="w-full h-64 overflow-hidden rounded-xl border border-gray-200 relative bg-gray-50 z-10">
          <img
            src={post.images[0]}
            alt="Post Attach"
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      )}

      {/* Bottom Action indicators */}
      <div className="flex flex-row items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500 relative z-10 w-full">
        
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Likes & Dislikes */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Like */}
            <button
              onClick={() => handleLike(post.id)}
              disabled={Boolean(post.myReaction)}
              className={`flex items-center gap-1 hover:text-gray-800 transition-all cursor-pointer bg-white border-none ${post.hasLiked ? 'text-green-600 font-extrabold scale-[1.03]' : 'text-gray-500'} ${post.myReaction ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <ThumbsUp className={`w-4 h-4 transition-transform duration-300 active:scale-150 ${post.hasLiked ? 'text-green-600 fill-green-600' : 'text-gray-400'}`} />
              <span>{post.likes}</span>
            </button>

            {/* Dislike */}
            <button
              onClick={() => handleDislike(post.id)}
              disabled={Boolean(post.myReaction)}
              className={`flex items-center gap-1 hover:text-gray-800 transition-all cursor-pointer bg-white border-none ${post.hasDisliked ? 'text-red-500 font-extrabold scale-[1.03]' : 'text-gray-500'} ${post.myReaction ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <ThumbsDown className={`w-4 h-4 transition-transform duration-300 active:scale-150 ${post.hasDisliked ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
              <span>{post.dislikes}</span>
            </button>
          </div>

          {/* Comments trigger */}
          <button
            onClick={() => setOpenCommentsPostId(openCommentsPostId === post.id ? null : post.id)}
            className="flex items-center gap-1.5 hover:text-gray-800 transition-colors cursor-pointer bg-white border-none font-semibold"
          >
            <MessageSquare className="w-4 h-4 text-gray-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">{post.comments.length} {t('commentStat')}</span>
            <span className="inline sm:hidden">{post.comments.length}</span>
          </button>
        </div>

        {/* Actions Dropdown Button (3-dots) */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdownPostId(activeDropdownPostId === post.id ? null : post.id);
            }}
            className="flex items-center gap-1.5 p-1.5 sm:p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-800 rounded-xl transition-all cursor-pointer bg-white border-none"
            title={language === 'vi' ? 'Thao tác' : 'Actions'}
          >
            <MoreHorizontal className="w-5 h-5 text-gray-400" />
          </button>

          {activeDropdownPostId === post.id && (
            <div className="absolute right-0 bottom-10 w-48 bg-white border border-gray-200 rounded-2xl shadow-xl py-2 z-50 animate-scale-up select-none">
              {/* Case A: Is the Owner of the post */}
              {post.authorId === currentUser?.id ? (
                <>
                  {/* Option 1: Can DELETE if 0 likes AND 0 comments */}
                  {post.likes === 0 && post.comments.length === 0 ? (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="w-full text-left px-4 py-2 text-xs font-extrabold text-red-650 hover:bg-red-50 transition-colors flex items-center gap-2 border-none bg-transparent cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                      <span>{language === 'vi' ? 'Xóa bài viết' : 'Delete Post'}</span>
                    </button>
                  ) : (
                    /* Option 2: Can HIDE or SHOW if likes > 0 OR comments > 0 */
                    post.status === 'hidden' ? (
                      <button
                        onClick={() => handleToggleHidePost(post.id, 'public')}
                        className="w-full text-left px-4 py-2 text-xs font-extrabold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 border-none bg-transparent cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-ricefield-green" />
                        <span>{language === 'vi' ? 'Hiển thị bài viết' : 'Show Post'}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleHidePost(post.id, 'hidden')}
                        className="w-full text-left px-4 py-2 text-xs font-extrabold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 border-none bg-transparent cursor-pointer"
                      >
                        <EyeOff className="w-4 h-4 text-gray-400" />
                        <span>{language === 'vi' ? 'Ẩn bài viết' : 'Hide Post'}</span>
                      </button>
                    )
                  )}
                </>
              ) : (
                /* Case B: NOT the Owner of the post */
                <button
                  onClick={() => handleReportPost(post.id)}
                  className="w-full text-left px-4 py-2 text-xs font-extrabold text-blue-700 hover:bg-blue-50 transition-colors flex items-center gap-2 border-none bg-transparent cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-blue-500 animate-pulse" />
                  <span>{language === 'vi' ? 'Báo cáo vi phạm' : 'Report Post'}</span>
                </button>
              )}

              {/* Share Link option inside menu */}
              <div className="border-t border-gray-100 my-1" />
              <button
                onClick={() => {
                  handleShareLink(post.id);
                  setActiveDropdownPostId(null);
                }}
                className={`w-full text-left px-4 py-2 text-xs font-extrabold transition-colors flex items-center gap-2 border-none bg-transparent cursor-pointer ${
                  sharedPostId === post.id ? 'text-green-600 hover:bg-green-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Share2 className="w-4 h-4 text-gray-400" />
                <span>
                  {sharedPostId === post.id 
                    ? (language === 'vi' ? 'Đã copy link!' : 'Copied!') 
                    : (language === 'vi' ? 'Chia sẻ liên kết' : 'Copy Share Link')}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>


      {/* Comment Thread */}
      {openCommentsPostId === post.id && (
        <div className="border-t border-gray-100 mt-2 pt-4 flex flex-col gap-4 bg-gray-50 p-4 rounded-xl relative z-10 animate-fade-in">
          <h4 className="font-outfit text-xs font-bold text-gray-900 tracking-wide uppercase">{t('commentTitle')}</h4>

          {/* Top Level Comments List */}
          <div className="flex flex-col gap-4">
            {post.comments.length === 0 ? (
              <span className="text-[11px] text-gray-400 font-semibold">{t('noComments')}</span>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="flex flex-col gap-2 bg-white border border-gray-200/80 p-3 rounded-xl shadow-sm hover:border-gray-300 transition-colors">
                  {/* Comment Header */}
                  <div className="flex gap-2.5 items-center justify-between">
                    <div className="flex gap-2.5 items-center">
                      <img
                        src={comment.userAvatar}
                        alt={comment.userName}
                        className="w-7 h-7 rounded-full object-cover border border-gray-100"
                      />
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11.5px] font-bold text-gray-900 leading-none">{comment.userName}</span>
                          {post.authorId && comment.userId && post.authorId === comment.userId && (
                            <span className="text-[10px] bg-heritage-amber/10 text-heritage-amber border border-heritage-amber/20 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                              {language === 'vi' ? 'Tác giả' : 'Author'}
                            </span>
                          )}
                        </div>
                        <span className="text-[10.5px] text-gray-400 mt-0.5">{language === 'vi' ? 'Vừa xong' : 'Just now'}</span>
                      </div>
                    </div>
                    {currentUser && currentUser.id === comment.userId && (
                      <button
                        onClick={() => handleDeleteComment(post.id, comment.id)}
                        className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer border-none bg-transparent"
                        title={language === 'vi' ? 'Xóa bình luận' : 'Delete comment'}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>


                  {/* Comment content */}
                  <p className="text-[12px] text-gray-700 leading-relaxed pl-9">
                    {comment.content[language]}
                  </p>

                  {/* Nested Replies Rendering */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="pl-9 mt-2 flex flex-col gap-2 border-l border-gray-200">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2 items-start mt-1 p-2 bg-gray-50 rounded-lg animate-fade-in">
                          <CornerDownRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                          <img
                            src={reply.userAvatar}
                            alt={reply.userName}
                            className="w-7 h-7 rounded-full object-cover border border-gray-150"
                          />
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between w-full">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-bold text-gray-900 leading-none">{reply.userName}</span>
                                {post.authorId && reply.userId && post.authorId === reply.userId && (
                                  <span className="text-[7.5px] bg-heritage-amber/10 text-heritage-amber border border-heritage-amber/20 font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider leading-none">
                                    {language === 'vi' ? 'Tác giả' : 'Author'}
                                  </span>
                                )}
                              </div>
                              {currentUser && currentUser.id === reply.userId && (
                                <button
                                  onClick={() => handleDeleteComment(post.id, reply.id)}
                                  className="p-0.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors cursor-pointer border-none bg-transparent"
                                  title={language === 'vi' ? 'Xóa phản hồi' : 'Delete reply'}
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-600 mt-1 leading-normal">
                              {reply.content[language]}
                            </p>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply trigger input */}
                  <div className="pl-9 mt-2">
                    {activeReplyBoxId === comment.id ? (
                      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center animate-fade-in">
                        <input
                          type="text"
                          value={replyInputs[comment.id] || ''}
                          onChange={(e) => setReplyInputs({ ...replyInputs, [comment.id]: e.target.value })}
                          placeholder={t('replyPlaceholder')}
                          className="flex-grow bg-white border border-gray-200 text-xs text-gray-800 rounded-lg px-2.5 py-1 focus:outline-none focus:border-heritage-amber"
                        />
                        <button
                          onClick={() => handleAddReply(post.id, comment.id)}
                          className="px-3 py-2 sm:py-1 bg-ricefield-green hover:bg-ricefield-light text-white font-bold text-[10px] rounded-lg cursor-pointer border-none shadow-sm transition-colors w-full sm:w-auto"
                        >
                          {t('replyButton')}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveReplyBoxId(comment.id)}
                        className="text-[10px] text-gray-400 hover:text-heritage-amber font-bold cursor-pointer bg-transparent border-none"
                      >
                        {t('replyTrigger')}
                      </button>
                    )}
                  </div>

                </div>
              ))
            )}
          </div>

          {/* Create top-level comment Input */}
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center border-t border-gray-200 pt-3">
            <input
              type="text"
              value={commentInputs[post.id] || ''}
              onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
              placeholder={t('commentPlaceholder')}
              className="flex-grow bg-white border border-gray-200 text-xs text-gray-800 rounded-xl px-4 py-2.5 focus:outline-none focus:border-heritage-amber placeholder-gray-400 shadow-inner"
            />
            <button
              onClick={() => handleAddComment(post.id)}
              className="p-2.5 bg-heritage-amber hover:bg-heritage-gold text-white rounded-xl flex items-center justify-center cursor-pointer border-none shadow-sm transition-colors w-full sm:w-auto"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}

    </article>
  );
}
