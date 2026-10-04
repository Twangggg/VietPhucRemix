import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Compass, ShieldCheck, Shirt, Layers } from 'lucide-react';
import { GARMENTS } from '../data';
import { GarmentCard } from '../components/GarmentCard';

export interface HomeProps {
  onNavigateToStudio?: () => void;
  onNavigateToExplore?: () => void;
}

export const Home: React.FC<HomeProps> = ({
  onNavigateToStudio,
  onNavigateToExplore
}) => {
  // 3 cổ phục tiêu biểu làm preview
  const featuredGarments = GARMENTS.slice(0, 4);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col justify-between selection:bg-red-100 selection:text-red-900">
      {/* HERO SECTION GỌN GÀNG, TINH TẾ */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-10 sm:py-16 overflow-hidden border-b border-stone-200/80">
        {/* Nền phong vị hoài cổ đương đại: Ánh sáng ấm, gradient be & stone */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/70 via-stone-50 to-stone-100/60 pointer-events-none -z-10" />

        <div className="max-w-3xl mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-500">
          {/* Tiêu đề chính (Typography to, rõ ràng) */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.15]">
            Xuyên Không Gian, <br className="hidden sm:inline" />
            <span className="text-red-700">Chạm Di Sản</span>
          </h1>

          {/* Phụ đề */}
          <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed max-w-xl mx-auto font-sans">
            Trải nghiệm phối đồ Cổ phục Việt Nam với hơi thở thời trang đương đại.
          </p>

          {/* Call-to-Action (CTA): Nút bấm nổi bật dẫn đến /studio */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/studio"
              onClick={onNavigateToStudio}
              className="group px-6 py-3 rounded-xl bg-red-700 hover:bg-red-800 text-white text-sm font-semibold transition-all duration-300 shadow-md shadow-red-700/25 hover:shadow-lg hover:shadow-red-700/35 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Bắt đầu phối đồ</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/explore"
              onClick={onNavigateToExplore}
              className="px-6 py-3 rounded-xl bg-white hover:bg-stone-100 text-stone-800 text-sm font-medium border border-stone-300/80 transition-all duration-300 shadow-xs hover:shadow-sm flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-red-700" />
              <span>Khám phá kho tư liệu</span>
            </Link>
          </div>

          {/* 3 giá trị cốt lõi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10 border-t border-stone-200/60 max-w-3xl mx-auto text-left">
            <div className="p-3.5 rounded-xl bg-white/70 border border-stone-200/60 space-y-1">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Shirt className="w-3.5 h-3.5 text-red-700" /> 10 Cổ phục nguyên bản
              </span>
              <p className="text-[11px] text-stone-500">
                Từ thời Lý, Trần, Lê đến triều Nguyễn với tư liệu lịch sử đối chiếu chính xác.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/70 border border-stone-200/60 space-y-1">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-red-700" /> 38 Món đồ thời trang
              </span>
              <p className="text-[11px] text-stone-500">
                Thử nghiệm phối kết cùng quần jeans, áo phông, blazer và giày thể thao đương đại.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/70 border border-stone-200/60 space-y-1">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-red-700" /> 5 Quy chuẩn bất biến
              </span>
              <p className="text-[11px] text-stone-500">
                Bộ lọc quy tắc nghiêm ngặt bảo toàn nét tôn nghiêm và giá trị văn hóa Việt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TUYỂN CHỌN CỔ PHỤC TIÊU BIỂU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-8 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-stone-200/80 pb-4 gap-3">
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-red-700 font-semibold">
              Di sản tiêu biểu
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1">
              Cổ Phục Đại Việt Biểu Tượng
            </h2>
          </div>

          <Link
            to="/explore"
            onClick={onNavigateToExplore}
            className="text-xs font-semibold text-red-700 hover:text-red-800 flex items-center gap-1 group"
          >
            Xem tất cả {GARMENTS.length} cổ phục
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Lưới GarmentCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredGarments.map((garment) => (
            <GarmentCard
              key={garment.id}
              item={garment}
              onClick={onNavigateToExplore}
            />
          ))}
        </div>
      </section>

      {/* TUYÊN NGÔN VĂN HÓA FOOTNOTE */}
      <footer className="border-t border-stone-200 py-8 px-4 text-center bg-white">
        <p className="text-xs text-stone-500 font-sans">
          Việt Phục Remix • Dự án số hóa và lan tỏa thẩm mỹ trang phục truyền thống Việt Nam.
        </p>
      </footer>
    </div>
  );
};

export default Home;
