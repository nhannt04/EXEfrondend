import React from 'react';
import { Trash2 } from 'lucide-react';

export default function DiariesTab(props) {
  const {
    language, diaries, getCategoryLabel, handleDeleteDiary
  } = props;

  return (
    <>
      <div className="flex flex-col gap-4">
        <h3 className="font-outfit text-lg font-extrabold text-gray-900 mb-2">
          {language === 'vi' ? 'Kiểm duyệt Nhật ký Hành trình' : 'Moderate Travel Diaries'}
        </h3>
        <div className="overflow-x-auto border border-gray-150 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                <th className="p-4">{language === 'vi' ? 'Tác giả' : 'Author'}</th>
                <th className="p-4">{language === 'vi' ? 'Phân loại' : 'Category'}</th>
                <th className="p-4 w-1/3">{language === 'vi' ? 'Nội dung' : 'Content'}</th>
                <th className="p-4 text-center">{language === 'vi' ? 'Tương tác' : 'Interactions'}</th>
                <th className="p-4 text-center">{language === 'vi' ? 'Hành động' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {diaries.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/55 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img src={post.user?.avatar} alt={post.user?.name || 'user avatar'} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    <span className="font-bold text-gray-900">{post.user?.name}</span>
                  </td>
                  <td className="p-4 uppercase tracking-widest text-[9px] font-extrabold text-ricefield-green">
                    {getCategoryLabel(post.category)}
                  </td>
                  <td className="p-4 truncate max-w-xs text-gray-600 text-sm">
                    {language === 'vi' ? post.content?.vi : post.content?.en}
                  </td>
                  <td className="p-4 text-center font-bold text-gray-500">
                    ❤️ {post.likes} | 💬 {post.comments?.length || 0}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDeleteDiary(post.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                      title={language === 'vi' ? 'Xoá / Gỡ bỏ bài viết' : 'Delete / Remove post'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
