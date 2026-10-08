import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, CheckCircle, AlertTriangle, Scale, Image as ImageIcon } from 'lucide-react';
import { CompareResult, Winner } from '../utils/compareEngine';
import { findCatalogItem } from '../utils/validationEngine';
import { getSafeImageUrl, resolveItemByGender } from '../utils/helpers';
import { SafeImage } from '../components/SafeImage';

interface CompareState {
  result: CompareResult;
  outfitAName: string;
  outfitBName: string;
  inputA: { itemIds: string[], gender: string };
  inputB: { itemIds: string[], gender: string };
}

export const CompareResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as CompareState | undefined;

  if (!state || !state.result) {
    return (
      <div className="flex flex-col items-center justify-center p-10 h-[60vh]">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Không tìm thấy dữ liệu so sánh</h2>
        <button
          onClick={() => navigate('/collection')}
          className="px-6 py-2 bg-red-700 text-white rounded-xl shadow-md font-semibold hover:bg-red-800 transition-colors"
        >
          Quay lại Bộ sưu tập
        </button>
      </div>
    );
  }

  const { result, outfitAName, outfitBName, inputA, inputB } = state;

  const renderWinnerBadge = (winner: Winner, isA: boolean) => {
    if (winner === 'TIE') return <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded uppercase tracking-wider">Hòa</span>;
    if ((winner === 'A' && isA) || (winner === 'B' && !isA)) {
      return <span className="text-[10px] font-semibold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wider"><Trophy className="w-3 h-3" /> Thắng</span>;
    }
    return null;
  };

  const renderItemsList = (itemIds: string[], gender: string) => {
    return (
      <div className="flex flex-col gap-3 mt-4">
        {itemIds.map((id, idx) => {
          const found = findCatalogItem(id);
          if (!found) return null;
          const { item } = found;
          const resolvedItem = resolveItemByGender(item as any, gender);
          const imageUrl = resolvedItem.resolvedImageUrl || getSafeImageUrl(resolvedItem);
          return (
            <div key={`${id}-${idx}`} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-stone-100 shadow-xs">
              <div className="w-12 h-12 bg-[#FAF7F2] rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                {imageUrl ? (
                  <SafeImage src={imageUrl} alt={resolvedItem.name} expectedPath={imageUrl} className="w-full h-full object-contain mix-blend-multiply" />
                ) : (
                  <ImageIcon className="w-5 h-5 text-stone-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-mono text-stone-400 uppercase font-semibold">{resolvedItem.category || resolvedItem.type}</div>
                <div className="text-sm font-bold text-stone-800 line-clamp-1">{resolvedItem.name}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 bg-white p-4 rounded-2xl shadow-sm border border-stone-100">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/collection')}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-500 hover:text-stone-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-red-700" />
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-stone-900 tracking-tight">Kết quả So Sánh</h1>
          </div>
        </div>
      </div>

      <div className="space-y-8">

        {/* Danh sách Item 2 bên */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-stone-900">Chi tiết thành phần</h2>
            <div className="h-px bg-stone-200 flex-1"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* VS Badge */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-stone-900 border-4 border-[#F9F8F6] rounded-full items-center justify-center font-black text-white shadow-md z-10">
              VS
            </div>

            <div className={`p-5 rounded-2xl border-2 ${result.overallWinner === 'A' ? 'border-red-700 bg-white shadow-md' : 'border-stone-200 bg-white/50'}`}>
              <h3 className="text-lg font-bold text-stone-800 line-clamp-2 mb-2 min-h-[3.5rem]">{outfitAName}</h3>
              {result.overallWinner === 'A' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-700 text-white text-xs font-bold rounded-full mb-2 shadow-sm">
                  <Trophy className="w-3.5 h-3.5" /> Thắng cuộc (+{result.totalDifference} điểm)
                </div>
              )}
              {renderItemsList(inputA.itemIds, inputA.gender)}
            </div>

            <div className={`p-5 rounded-2xl border-2 ${result.overallWinner === 'B' ? 'border-red-700 bg-white shadow-md' : 'border-stone-200 bg-white/50'}`}>
              <h3 className="text-lg font-bold text-stone-800 line-clamp-2 mb-2 min-h-[3.5rem]">{outfitBName}</h3>
              {result.overallWinner === 'B' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-700 text-white text-xs font-bold rounded-full mb-2 shadow-sm">
                  <Trophy className="w-3.5 h-3.5" /> Thắng cuộc (+{result.totalDifference} điểm)
                </div>
              )}
              {renderItemsList(inputB.itemIds, inputB.gender)}
            </div>
          </div>
        </section>

        {/* Bảng điểm chi tiết */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-stone-900">Bảng điểm & Đánh giá</h2>
            <div className="h-px bg-stone-200 flex-1"></div>
          </div>
          <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-stone-200 overflow-hidden">

            {/* Tổng điểm */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="text-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="text-sm font-medium text-stone-500 mb-1">{outfitAName}</div>
              </div>
              <div className="text-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="text-4xl font-black text-stone-900">{result.outfitA.totalScore}</div>
                <div className="text-xs font-semibold text-stone-500 mt-1 uppercase tracking-wider">{result.outfitA.tierLabel}</div>
              </div>
              <div className="text-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="text-sm font-medium text-stone-500 mb-1">{outfitBName}</div>
              </div>
              <div className="text-center p-4 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="text-4xl font-black text-stone-900">{result.outfitB.totalScore}</div>
                <div className="text-xs font-semibold text-stone-500 mt-1 uppercase tracking-wider">{result.outfitB.tierLabel}</div>
              </div>
            </div>

            <table className="w-full text-sm text-left mb-8 table-fixed">
              <thead>
                <tr className="text-stone-500 border-b border-stone-100">
                  <th className="py-3 font-medium w-[40%]">Tiêu chí</th>
                  <th className="py-3 font-medium text-center w-[30%]">Outfit A</th>
                  <th className="py-3 font-medium text-center w-[30%]">Outfit B</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {Object.entries(result.breakdown).map(([key, winner]) => {
                  const criterionMap: Record<string, string> = {
                    cultural: 'Văn hóa & Phom dáng',
                    event: 'Phù hợp Bối cảnh',
                    itemCompatibility: 'Tương thích Item',
                    color: 'Màu sắc',
                    completeness: 'Độ hoàn thiện'
                  };
                  const aScore = result.outfitA.criteria[key as keyof typeof result.breakdown].weightedScore;
                  const bScore = result.outfitB.criteria[key as keyof typeof result.breakdown].weightedScore;

                  return (
                    <tr key={key} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3.5 font-semibold text-stone-700">{criterionMap[key] || key}</td>
                      <td className="py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`text-base font-bold ${winner === 'A' ? 'text-red-700' : 'text-stone-900'}`}>{aScore}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`text-base font-bold ${winner === 'B' ? 'text-red-700' : 'text-stone-900'}`}>{bScore}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Nhận xét / Điểm mạnh */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl">
                <h5 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Nhận xét Outfit A</h5>
                {result.strengthsA.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-stone-700 space-y-1.5 font-medium leading-relaxed">
                    {result.strengthsA.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                ) : <p className="text-sm text-stone-500 italic">Không có điểm nổi trội cụ thể.</p>}
              </div>
              <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl">
                <h5 className="font-bold text-stone-900 mb-3 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Nhận xét Outfit B</h5>
                {result.strengthsB.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-stone-700 space-y-1.5 font-medium leading-relaxed">
                    {result.strengthsB.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                ) : <p className="text-sm text-stone-500 italic">Không có điểm nổi trội cụ thể.</p>}
              </div>
            </div>

            {/* Cảnh báo (nếu có) */}
            {result.culturalWarnings.length > 0 && (
              <div className="mt-5 bg-red-50 border border-red-200 p-5 rounded-2xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-bold text-red-900 mb-2">Lưu ý Quy chuẩn</h5>
                  <ul className="list-disc list-inside text-sm text-red-800 space-y-1.5 font-medium leading-relaxed">
                    {result.culturalWarnings.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              </div>
            )}

          </div>
        </section>

      </div >
    </div >
  );
};
