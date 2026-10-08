import React from 'react';
import { X, Trophy, AlertTriangle, CheckCircle, Scale } from 'lucide-react';
import { CompareResult, Winner } from '../utils/compareEngine';

interface CompareResultModalProps {
  result: CompareResult | null;
  outfitAName: string;
  outfitBName: string;
  onClose: () => void;
}

export const CompareResultModal: React.FC<CompareResultModalProps> = ({
  result,
  outfitAName,
  outfitBName,
  onClose
}) => {
  if (!result) return null;

  const renderWinnerBadge = (winner: Winner, isA: boolean) => {
    if (winner === 'TIE') return <span className="text-xs font-semibold text-stone-500 bg-stone-100 px-2 py-0.5 rounded">Hòa</span>;
    if ((winner === 'A' && isA) || (winner === 'B' && !isA)) {
      return <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded flex items-center gap-1"><Trophy className="w-3 h-3"/> Thắng</span>;
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-700" />
            <h2 className="text-xl font-bold font-serif text-stone-900">Kết quả So Sánh</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Tổng quan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <div className={`p-5 rounded-2xl border-2 ${result.overallWinner === 'A' ? 'border-green-500 bg-green-50/30' : 'border-stone-200 bg-stone-50'}`}>
              <h3 className="text-lg font-bold text-stone-800 line-clamp-1 mb-2">{outfitAName}</h3>
              <div className="text-4xl font-black text-stone-900 mb-1">{result.outfitA.totalScore} <span className="text-sm font-normal text-stone-500">/ 100</span></div>
              <div className="text-sm font-medium text-stone-600 mb-4">{result.outfitA.tierLabel}</div>
              {result.overallWinner === 'A' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                  <Trophy className="w-3.5 h-3.5" /> Outfit Chiến Thắng (+{result.totalDifference} điểm)
                </div>
              )}
            </div>
            
            <div className={`p-5 rounded-2xl border-2 ${result.overallWinner === 'B' ? 'border-green-500 bg-green-50/30' : 'border-stone-200 bg-stone-50'}`}>
              <h3 className="text-lg font-bold text-stone-800 line-clamp-1 mb-2">{outfitBName}</h3>
              <div className="text-4xl font-black text-stone-900 mb-1">{result.outfitB.totalScore} <span className="text-sm font-normal text-stone-500">/ 100</span></div>
              <div className="text-sm font-medium text-stone-600 mb-4">{result.outfitB.tierLabel}</div>
              {result.overallWinner === 'B' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                  <Trophy className="w-3.5 h-3.5" /> Outfit Chiến Thắng (+{result.totalDifference} điểm)
                </div>
              )}
            </div>

            {/* VS Badge */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border border-stone-200 rounded-full items-center justify-center font-black text-stone-400 shadow-sm z-10">
              VS
            </div>
          </div>

          {/* Chi tiết từng tiêu chí */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-800 text-lg border-b border-stone-100 pb-2">Phân tích chi tiết</h4>
            
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-stone-500 border-b border-stone-100">
                  <th className="py-3 font-medium">Tiêu chí</th>
                  <th className="py-3 font-medium text-center">{outfitAName}</th>
                  <th className="py-3 font-medium text-center">{outfitBName}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
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
                    <tr key={key} className="hover:bg-stone-50/50">
                      <td className="py-3 font-medium text-stone-700">{criterionMap[key] || key}</td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-semibold">{aScore}</span>
                          {renderWinnerBadge(winner, true)}
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-semibold">{bScore}</span>
                          {renderWinnerBadge(winner, false)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Điểm mạnh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
              <h5 className="font-bold text-indigo-900 mb-2 flex items-center gap-1.5"><CheckCircle className="w-4 h-4"/> Điểm mạnh của Outfit A</h5>
              {result.strengthsA.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-indigo-800 space-y-1">
                  {result.strengthsA.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              ) : <p className="text-sm text-indigo-700/70 italic">Không có điểm nổi trội hơn</p>}
            </div>
            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl">
              <h5 className="font-bold text-indigo-900 mb-2 flex items-center gap-1.5"><CheckCircle className="w-4 h-4"/> Điểm mạnh của Outfit B</h5>
              {result.strengthsB.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-indigo-800 space-y-1">
                  {result.strengthsB.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              ) : <p className="text-sm text-indigo-700/70 italic">Không có điểm nổi trội hơn</p>}
            </div>
          </div>

          {/* Cultural Warnings */}
          {result.culturalWarnings.length > 0 && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-red-900 mb-1">Cảnh báo quy chuẩn</h5>
                <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                  {result.culturalWarnings.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
            </div>
          )}

        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-stone-900 text-white text-sm font-semibold rounded-xl hover:bg-stone-800 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
