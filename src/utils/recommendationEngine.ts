/**
 * ENGINE GỢI Ý PHỐI ĐỒ TỰ ĐỘNG (QUICK MATCH / RECOMMENDATION ENGINE)
 * Phục vụ EPIC 04 — Quick Match 1-Click
 * Tự động tạo set đồ hoàn chỉnh chuẩn văn hóa dựa trên Cổ phục và Giới tính
 */

export interface QuickMatchSuggestion {
  innerId: string | null;
  bottomId: string | null;
  shoesId: string | null;
  headwearId: string | null;
  jewelryIds: string[];
  vibeTitle: string;
  description: string;
}

// BỘ PRESET PHỐI ĐỒ CHUẨN VĂN HÓA CHO TỪNG LOẠI CỔ PHỤC
const QUICK_MATCH_PRESETS: Record<
  string,
  {
    female: QuickMatchSuggestion;
    male: QuickMatchSuggestion;
  }
> = {
  // 1. ÁO DÀI TÂN THỜI (V01)
  V01: {
    female: {
      innerId: null,
      bottomId: 'cs_04', // Quần Culottes lụa/đũi
      shoesId: 'cs_17', // Giày cao gót quai mảnh
      headwearId: 'acc_04', // Mấn đội đầu cách tân
      jewelryIds: ['acc_02'], // Chuỗi ngọc trai
      vibeTitle: 'Áo Dài Tân Thời Thanh Lịch',
      description: 'Phối cùng quần lụa suông mềm, mấn cách tân và chuỗi ngọc trai tôn vinh nét duyên dáng phương Đông.'
    },
    male: {
      innerId: null,
      bottomId: 'cs_03', // Quần Tây ống suông
      shoesId: 'cs_15', // Giày Loafer da cổ điển
      headwearId: 'acc_05', // Khăn đóng chuẩn thức
      jewelryIds: [],
      vibeTitle: 'Áo Dài Nam Nho Nhã Đương Đại',
      description: 'Kết hợp cùng quần tây may đo và giày da cổ điển tạo nên diện mạo lịch lãm, đĩnh đạc.'
    }
  },

  // 2. ÁO TỨ THÂN (V02)
  V02: {
    female: {
      innerId: 'cs_27', // Áo quây dệt kim / Yếm
      bottomId: 'cs_07', // Chân váy Maxi xếp ly
      shoesId: 'cs_35', // Guốc mộc cao gót
      headwearId: 'acc_08', // Nón quai thao
      jewelryIds: ['acc_01'], // Kiềng bạc chạm hoa mai
      vibeTitle: 'Tứ Thân Dạo Hội Mùa Xuân',
      description: 'Phối cùng áo quây lót trong, chân váy dài thướt tha, nón ba tầm và kiềng bạc cổ truyền.'
    },
    male: {
      innerId: 'cs_10',
      bottomId: 'cs_03',
      shoesId: 'cs_14',
      headwearId: null,
      jewelryIds: [],
      vibeTitle: 'Tứ Thân Cách Tân Nam',
      description: 'Set phối tối giản hài hòa cho phong cách dân gian đương đại.'
    }
  },

  // 3. ÁO YẾM (V03)
  V03: {
    female: {
      innerId: null,
      bottomId: 'cs_22', // Chân váy lụa Satin dáng suông
      shoesId: 'cs_18', // Sandal bệt dây mảnh
      headwearId: 'acc_06', // Nón lá bài thơ
      jewelryIds: ['acc_01'], // Kiềng bạc
      vibeTitle: 'Yếm Đào Nắng Hạ Tinh Khôi',
      description: 'Phối cùng chân váy lụa satin mượt mà và kiềng bạc cổ điển cho các buổi chụp ảnh nghệ thuật.'
    },
    male: {
      innerId: 'cs_10',
      bottomId: 'cs_03',
      shoesId: 'cs_14',
      headwearId: null,
      jewelryIds: [],
      vibeTitle: 'Yếm Đào Tối Giản',
      description: 'Set phối cơ bản an toàn.'
    }
  },

  // 4. ÁO BÀ BA (V04)
  V04: {
    female: {
      innerId: 'cs_10', // Áo phông trắng
      bottomId: 'cs_04', // Quần Culottes lụa/đũi
      shoesId: 'cs_35', // Guốc mộc
      headwearId: 'acc_06', // Nón lá bài thơ
      jewelryIds: ['acc_07'], // Khăn rằn Nam Bộ
      vibeTitle: 'Bà Ba Nam Bộ Phóng Khoáng',
      description: 'Kết hợp cùng quần lụa đen buông nhẹ, nón lá truyền thống và khăn rằn mộc mạc đậm chất phương Nam.'
    },
    male: {
      innerId: 'cs_10',
      bottomId: 'cs_20', // Quần Linen ống suông
      shoesId: 'cs_14', // Sneaker trắng
      headwearId: null,
      jewelryIds: ['acc_07'], // Khăn rằn
      vibeTitle: 'Bà Ba Phong Trần Sông Nước',
      description: 'Phối cùng quần linen thoáng mát và khăn rằn Nam Bộ tự do, hào sảng.'
    }
  },

  // 5. ÁO NGŨ THÂN TAY CHẼN (V05)
  V05: {
    female: {
      innerId: 'cs_11_2', // Áo cổ lọ ôm sát
      bottomId: 'cs_03', // Quần Tây ống suông
      shoesId: 'cs_16', // Giày Mary Jane
      headwearId: 'acc_04', // Mấn cách tân
      jewelryIds: ['acc_01'], // Kiềng bạc
      vibeTitle: 'Ngũ Thân Tay Chẽn Smart-Casual',
      description: 'Sự giao thoa hoàn hảo giữa quốc phục thời Nguyễn và phong thái thời trang công sở tri thức hiện đại.'
    },
    male: {
      innerId: 'cs_10',
      bottomId: 'cs_03', // Quần Tây ống suông
      shoesId: 'cs_15', // Giày Loafer da
      headwearId: 'acc_05', // Khăn đóng
      jewelryIds: ['acc_03'], // Quạt giấy dó
      vibeTitle: 'Ngũ Thân Trí Thức Hà Thành',
      description: 'Phong thái đĩnh đạc, nho nhã của giới trí thức với khăn đóng, quần âu may đo và giày da.'
    }
  },

  // 6. ÁO TẤC (NGŨ THÂN TAY THỤNG - V06)
  V06: {
    female: {
      innerId: 'cs_10',
      bottomId: 'cs_07', // Chân váy Maxi xếp ly
      shoesId: 'cs_35', // Guốc mộc cao gót
      headwearId: 'acc_04', // Mấn đội đầu
      jewelryIds: ['acc_01'], // Kiềng bạc
      vibeTitle: 'Áo Tấc Cung Đình Trang Trọng',
      description: 'Lễ phục uy nghiêm với tay thụng to bản, kết hợp chân váy maxi và mấn vấn trang trọng.'
    },
    male: {
      innerId: 'cs_10',
      bottomId: 'cs_03', // Quần tây
      shoesId: 'cs_37', // Giày Oxford
      headwearId: 'acc_05', // Khăn đóng
      jewelryIds: ['acc_03'], // Quạt xếp
      vibeTitle: 'Áo Tấc Lễ Nghi Nghiêm Cẩn',
      description: 'Chuẩn mực lễ nghi truyền thống cho các sự kiện văn hóa, đại lễ và ngày hội di sản.'
    }
  },

  // 7. ÁO NHẬT BÌNH (V07)
  V07: {
    female: {
      innerId: 'cs_12', // Áo hai dây lụa
      bottomId: 'cs_07', // Chân váy Maxi xếp ly
      shoesId: 'cs_33', // Giày búp bê Ballet
      headwearId: 'acc_04', // Mấn cách tân
      jewelryIds: ['acc_01', 'acc_02'], // Kiềng bạc & Chuỗi ngọc trai
      vibeTitle: 'Nhật Bình Hoàng Phái Diễm Lệ',
      description: 'Khoác ngoài lộng lẫy với hoa văn ngũ sắc, phối cùng chân váy xếp ly dài và trang sức ngọc trai quý phái.'
    },
    male: {
      innerId: 'cs_10',
      bottomId: 'cs_03',
      shoesId: 'cs_15',
      headwearId: 'acc_05',
      jewelryIds: ['acc_01'],
      vibeTitle: 'Nhật Bình Lễ Hội Cung Đình',
      description: 'Set phối di sản hoàng gia trang trọng và nổi bật.'
    }
  },

  // 8. ÁO GIAO LĨNH (V08)
  V08: {
    female: {
      innerId: 'cs_27', // Áo quây dệt kim
      bottomId: 'cs_06', // Chân váy chữ A
      shoesId: 'cs_14', // Sneaker trắng
      headwearId: null,
      jewelryIds: ['acc_01'], // Kiềng bạc
      vibeTitle: 'Giao Lĩnh Dạo Phố Trẻ Trung',
      description: 'Nét cổ kính của cổ áo giao nhau kết hợp chân váy chữ A và sneaker tạo nên phong cách dạo phố ấn tượng.'
    },
    male: {
      innerId: 'cs_10',
      bottomId: 'cs_01', // Quần Jeans ống rộng
      shoesId: 'cs_14', // Sneaker trắng
      headwearId: null,
      jewelryIds: [],
      vibeTitle: 'Giao Lĩnh Phóng Khoáng Đương Đại',
      description: 'Phối cùng quần jeans ống rộng và sneaker trắng mang hơi thở streetwear hiện đại.'
    }
  },

  // 9. ÁO ĐỐI KHÂM (V09)
  V09: {
    female: {
      innerId: 'cs_12', // Áo hai dây lụa
      bottomId: 'cs_22', // Chân váy lụa Satin
      shoesId: 'cs_34', // Giày Mule mũi nhọn
      headwearId: null,
      jewelryIds: ['acc_02'], // Chuỗi ngọc trai
      vibeTitle: 'Đối Khâm Thơ Mộng & Bay Bổng',
      description: 'Dáng áo khoác buông tà song song, hòa cùng váy lụa satin mượt mà cho cảm giác bay bổng nhẹ nhàng.'
    },
    male: {
      innerId: 'cs_10',
      bottomId: 'cs_20',
      shoesId: 'cs_14',
      headwearId: null,
      jewelryIds: [],
      vibeTitle: 'Đối Khâm Thanh Thoát',
      description: 'Set đồ mộc mạc, phóng khoáng cho các không gian thưởng trà, nghệ thuật.'
    }
  }
};

/**
 * Hàm lấy gợi ý phối đồ nhanh (Quick Match) cho Cổ phục và Giới tính
 * @param garmentId Mã Cổ phục (V01, V02, V05, ...)
 * @param gender Giới tính người mặc ('male' | 'female')
 * @returns QuickMatchSuggestion chứa các ID an toàn, chuẩn văn hóa
 */
export function getQuickMatchSuggestion(
  garmentId?: string | null,
  gender: string = 'female'
): QuickMatchSuggestion {
  const normGender = gender.toLowerCase() === 'male' ? 'male' : 'female';

  if (!garmentId) {
    return {
      innerId: 'cs_10',
      bottomId: normGender === 'male' ? 'cs_03' : 'cs_04',
      shoesId: 'cs_14',
      headwearId: null,
      jewelryIds: [],
      vibeTitle: 'Set Phối Cơ Bản',
      description: 'Bộ phối cơ bản gồm áo phông trắng, quần suông và sneaker trắng tối giản.'
    };
  }

  // Chuẩn hóa ID dạng V01, V01_1, V01_2 -> V01
  const baseGarmentId = garmentId.toUpperCase().split('_')[0];

  const preset = QUICK_MATCH_PRESETS[baseGarmentId];
  if (preset && preset[normGender]) {
    return preset[normGender];
  }

  // Fallback an toàn (Basic Set) nếu món cổ phục chưa có kịch bản riêng
  return {
    innerId: 'cs_10', // Áo phông trắng basic
    bottomId: normGender === 'male' ? 'cs_03' : 'cs_04', // Quần Tây hoặc Culottes
    shoesId: 'cs_14', // Sneaker trắng tối giản
    headwearId: null,
    jewelryIds: [],
    vibeTitle: 'Set Phối Chuẩn Mực',
    description: 'Set đồ phối chuẩn mực hài hòa giữa nét truyền thống và phong cách tối giản đương đại.'
  };
}
