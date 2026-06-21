import re

with open('/home/michael/code/EXE/EXEfrondend/src/features/social/components/CommunityFeed.jsx', 'r') as f:
    content = f.read()

# Replace PostCard block
start_marker = "              filteredPosts.map((post, idx) => (\n                <article"
end_marker = "                </article>\n              ))\n            )}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker) + len(end_marker)

if start_idx != -1 and end_idx != -1:
    replacement = """              filteredPosts.map((post, idx) => (
                <PostCard
                  key={post.id}
                  post={post}
                  idx={idx}
                  currentUser={currentUser}
                  language={language}
                  t={t}
                  openCommentsPostId={openCommentsPostId}
                  setOpenCommentsPostId={setOpenCommentsPostId}
                  commentInputs={commentInputs}
                  setCommentInputs={setCommentInputs}
                  replyInputs={replyInputs}
                  setReplyInputs={setReplyInputs}
                  activeReplyBoxId={activeReplyBoxId}
                  setActiveReplyBoxId={setActiveReplyBoxId}
                  activeDropdownPostId={activeDropdownPostId}
                  setActiveDropdownPostId={setActiveDropdownPostId}
                  sharedPostId={sharedPostId}
                  activeHashtagFilter={activeHashtagFilter}
                  setActiveHashtagFilter={setActiveHashtagFilter}
                  handleLike={handleLike}
                  handleDislike={handleDislike}
                  handleReportPost={handleReportPost}
                  handleDeletePost={handleDeletePost}
                  handleToggleHidePost={handleToggleHidePost}
                  handleShareLink={handleShareLink}
                  handleAddComment={handleAddComment}
                  handleAddReply={handleAddReply}
                  handleDeleteComment={handleDeleteComment}
                />
              ))
            )}"""
    content = content[:start_idx] + replacement + content[end_idx:]
else:
    print("PostCard block not found")

# Replace LocalExpertSidebar block
start_marker2 = "        {/* Local Expert Sidebar Column */}\n        <div className=\"lg:col-span-4 flex flex-col gap-6\">\n\n          {/* Daily Cultural Quest Card with Shimmer trigger */}"
end_marker2 = "                  </div>\n                </div>\n              ))}\n            </div>\n\n          </div>\n\n        </div>"

start_idx2 = content.find(start_marker2)
end_idx2 = content.find(end_marker2) + len(end_marker2)

if start_idx2 != -1 and end_idx2 != -1:
    replacement2 = """        {/* Local Expert Sidebar Column */}
        <LocalExpertSidebar
          language={language}
          t={t}
          experts={experts}
          handleOpenExpertChat={handleOpenExpertChat}
          getTrendingHashtags={getTrendingHashtags}
          activeHashtagFilter={activeHashtagFilter}
          setActiveHashtagFilter={setActiveHashtagFilter}
          showQuestSuccess={showQuestSuccess}
          setShowQuestSuccess={setShowQuestSuccess}
        />"""
    content = content[:start_idx2] + replacement2 + content[end_idx2:]
else:
    print("LocalExpertSidebar block not found")

# Replace Modals
start_marker3 = "      {/* CULTURAL QUEST ACCEPTED MODAL */}"
end_marker3 = "      {/* QUICK EXPERT CHAT DIALOG */}"

start_idx3 = content.find(start_marker3)
end_idx3 = content.find(end_marker3)

if start_idx3 != -1 and end_idx3 != -1:
    replacement3 = """      {/* CULTURAL QUEST ACCEPTED MODAL */}
      <QuestSuccessModal
        showQuestSuccess={showQuestSuccess}
        setShowQuestSuccess={setShowQuestSuccess}
        language={language}
      />

      """
    content = content[:start_idx3] + replacement3 + content[end_idx3:]
else:
    print("QuestSuccessModal block not found")

start_marker4 = "      {/* QUICK EXPERT CHAT DIALOG */}"
end_marker4 = "    </div>\n  );\n}\n"

start_idx4 = content.find(start_marker4)
end_idx4 = content.find(end_marker4)

if start_idx4 != -1 and end_idx4 != -1:
    replacement4 = """      {/* QUICK EXPERT CHAT DIALOG */}
      <ExpertChatModal
        showChatModal={showChatModal}
        setShowChatModal={setShowChatModal}
        activeExpert={activeExpert}
        language={language}
        expertMessageText={expertMessageText}
        setExpertMessageText={setExpertMessageText}
        messageSuccess={messageSuccess}
        handleSendExpertMessage={handleSendExpertMessage}
      />

"""
    content = content[:start_idx4] + replacement4 + content[end_idx4:]
else:
    print("ExpertChatModal block not found")


with open('/home/michael/code/EXE/EXEfrondend/src/features/social/components/CommunityFeed.jsx', 'w') as f:
    f.write(content)

print("Done")
