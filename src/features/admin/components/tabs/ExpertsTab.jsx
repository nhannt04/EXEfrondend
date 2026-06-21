import React from 'react';
import { Star } from 'lucide-react';

export default function ExpertsTab(props) {
  const {
    language, experts, handleToggleExpertOnline
  } = props;

  return (
    <>
      <div className="flex flex-col gap-4">
        <h3 className="font-outfit text-lg font-extrabold text-gray-900 mb-2">
          {language === 'vi' ? 'Hội đồng Chuyên gia bản địa Hội An' : 'Hoi An Local Experts Council'}
        </h3>
        <div className="overflow-x-auto border border-gray-150 rounded-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-500">
                <th className="p-4">{language === 'vi' ? 'Chuyên gia' : 'Expert'}</th>
                <th className="p-4">{language === 'vi' ? 'Lĩnh vực tư vấn chính' : 'Consulting Specialty'}</th>
                <th className="p-4">{language === 'vi' ? 'Đánh giá' : 'Rating'}</th>
                <th className="p-4">{language === 'vi' ? 'Trạng thái Online' : 'Online Status'}</th>
                <th className="p-4 text-center">{language === 'vi' ? 'Hành động' : 'Action'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {experts.map((exp) => (
                <tr key={exp.id} className="hover:bg-gray-50/55 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img src={exp.avatar} alt={exp.name} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
                    <span className="font-bold text-gray-900">{exp.name}</span>
                  </td>
                  <td className="p-4 text-gray-600 font-semibold">
                    {language === 'vi' ? exp.role?.vi : exp.role?.en}
                  </td>
                  <td className="p-4 font-bold text-heritage-amber flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-heritage-amber" /> {exp.rating}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className={"w-2 h-2 rounded-full relative " + (exp.online ? "bg-green-500 animate-pulse" : "bg-gray-400")} />
                      <span className="font-bold uppercase tracking-wider text-[10px] text-gray-500">
                        {exp.online
                          ? (language === 'vi' ? 'Trực tuyến' : 'Online')
                          : (language === 'vi' ? 'Ngoại tuyến' : 'Offline')}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleToggleExpertOnline(exp.id)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase border transition-all cursor-pointer ${exp.online
                          ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'
                        }`}
                    >
                      {exp.online
                        ? (language === 'vi' ? 'Tạm ẩn' : 'Deactivate')
                        : (language === 'vi' ? 'Kích hoạt' : 'Activate')}
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
