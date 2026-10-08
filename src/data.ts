import { Garment, CasualItem, ContextItem, OutfitCombination, AccessoryItem } from './types';

// DỮ LIỆU 11 VIỆT PHỤC GỐC
export const GARMENTS: Garment[] = [
  {
    id: "V01",
    name: "Áo dài tân thời",
    origin: "Phát triển từ áo ngũ thân tay chẽn thời Nguyễn. Bắt đầu cải biên mạnh mẽ từ thập niên 1930 với phong trào Le Mur (họa sĩ Cát Tường), Lê Phổ, tiếp tục định hình qua áo dài Raglan (thập niên 1960) và hoàn thiện thành phom dáng hiện đại.",
    characteristics: "Gồm 2 tà trước và sau dài chấm bắp chân hoặc gót chân; cổ cao hoặc tròn; tay raglan ráp chéo từ cổ nách; thân ôm sát eo tôn đường cong cơ thể; xẻ tà hai bên hông; mặc cùng quần lụa ống rộng dài chấm mu bàn chân.",
    usage_context: "Trang phục công sở, đồng phục học sinh/sinh viên, lễ tốt nghiệp, đám cưới hỏi, hội nghị quốc tế, ngày lễ Tết và các sự kiện ngoại giao.",
    colors: "Rất đa dạng. Trắng tinh khôi (học sinh), đỏ/hồng/vàng (cưới hỏi, lễ hội), pastel nhã nhặn hoặc sẫm màu (công sở, người trung niên).",
    accessories: "Giày cao gót bít mũi, mấn đội đầu (tùy dịp cưới hỏi), kiềng bạc/vàng, chuỗi ngọc trai, ví cầm tay.",
    significance: "Tôn vinh nét đẹp duyên dáng, kín đáo nhưng gợi cảm của phụ nữ Việt Nam; biểu tượng văn hóa quốc gia trong mắt bạn bè quốc tế.",
    notes: "Chọn nội y tệp màu da và phom dáng mượt mà để tránh hằn viền; chú ý độ hở eo hai bên tà để giữ tính lịch sự; tà áo dài dễ cuốn vào bánh xe khi di chuyển.",
    references: "Ngàn năm áo mũ (Trần Quang Đức); Trang phục Việt Nam (Đoàn Thị Tình).",
    type: "top",
    category: "top",
    gender: "unisex",
    formality: "formal",
    image_url: "assets/top/v01.jpg",
    has_gender_variants: true
  },
  {
    id: "V02",
    name: "Áo tứ thân",
    origin: "Trang phục dân gian truyền thống của phụ nữ vùng đồng bằng Bắc Bộ, hình thành từ trước thế kỷ 18 và phổ biến sâu rộng trong đời sống lao động nông nghiệp.",
    characteristics: "Thân áo xẻ giữa không cài cúc, dài qua gối. Lưng may ghép từ 2 mảnh vải (sống áo sau), phía trước là 2 tà rời được thắt nút trước bụng hoặc thả buông. Ống tay hẹp vừa phải; mặc lót áo yếm bên trong và khoác ngoài váy đầm xòe màu đen.",
    usage_context: "Lễ hội dân gian mùa xuân (hội Lim, hội đền Hùng), biểu diễn dân ca quan họ Bắc Ninh, diễn xướng dân gian.",
    colors: "Trang phục lao động mang màu nâu sồng, củ nâu, chàm; trang phục trẩy hội sử dụng tà áo ngoài màu tươi sáng (xanh cốm, hồng cánh sen, vàng mỡ gà) tương phản với váy đen.",
    accessories: "Nón quai thao (nón ba tầm), khăn mỏ quạ, dải yếm đào, thắt lưng bao lụa xanh/hồng, dép cong hoặc guốc mộc.",
    significance: "Biểu trưng cho sự tần tảo, mộc mạc và khéo léo của người phụ nữ thôn quê Bắc Bộ; bốn tà áo tượng trưng cho tứ thân phụ mẫu (cha mẹ mình và cha mẹ chồng).",
    notes: "Cần phân biệt rõ áo tứ thân mặc trẩy hội với trang phục diễn tuồng/chèo; khi mặc phải thắt nút tà áo hoặc bao lụa ngay ngắn, tránh để xộc xệch lộ yếm quá nhiều gây phản cảm.",
    references: "Trang phục phụ nữ các dân tộc Việt Nam (Viện Trang phục); Mỹ thuật thời Lê - Trịnh (Nguyễn Du Chi).",
    type: "outer",
    category: "outer_traditional",
    gender: "female",
    formality: "traditional",
    image_url: "assets/outer_traditional/v02.jpg"
  },
  {
    id: "V03",
    name: "Áo yếm",
    origin: "Đồ lót truyền thống của phụ nữ Việt, xuất hiện từ thời Lý - Trần và hoàn thiện phom dáng ổn định vào thời Hậu Lê - Nguyễn.",
    characteristics: "Tấm vải hình thoi hoặc vuông phủ kín ngực, cạnh trên khoét cong ôm cổ, cạnh dưới bo góc nhọn phủ xuống rốn. Cố định bằng hai dải dây buộc sau gáy và hai dải dây buộc ngang lưng. Có hai kiểu cổ chính: yếm cổ xây (khoét tròn kín đáo) và yếm cổ nhạn (khoét sâu chữ V).",
    usage_context: "Mặc lót bên trong áo tứ thân, áo cánh, áo ngũ thân; ngày nay dùng trong các bộ ảnh nghệ thuật, lễ hội dân gian hoặc biểu diễn múa truyền thống.",
    colors: "Phụ nữ lao động mặc yếm màu nâu, chàm; phụ nữ thị thành, trẩy hội chuộng yếm đào (hồng phấn), trắng ngà, xanh hồ thủy, đỏ son.",
    accessories: "Quần lĩnh, váy sồi đen, trâm cài tóc, dây chuyền bạc (nếu mặc cách tân).",
    significance: "Tượng trưng cho vẻ đẹp e ấp, đường nét cơ thể tự nhiên và đời sống nội tâm kín đáo của người phụ nữ phương Đông xưa.",
    notes: "Bản chất là nội y lót trong; tuyệt đối không mặc yếm trần đơn lẻ ra chốn công cộng, đền chùa hoặc các sự kiện trang nghiêm. Khi chụp ảnh nghệ thuật cần xử lý lớp lót/miếng dán ngực cẩn trọng.",
    references: "Đi tìm nét đẹp trang phục truyền thống (Trần Từ); Tìm hiểu trang phục Việt Nam (Đoàn Thị Tình).",
    type: "inner",
    category: "inner",
    gender: "female",
    formality: "casual",
    image_url: "assets/inner/v03.jpg"
  },
  {
    id: "V04",
    name: "Áo bà ba",
    origin: "Xuất hiện ở vùng Nam Bộ từ thế kỷ 19, chịu ảnh hưởng từ trang phục của người Ba-ba (nhóm người Hoa định cư tại vùng eo biển Malacca) kết hợp biến tấu với thói quen sinh hoạt vùng sông nước.",
    characteristics: "Thân áo xẻ giữa, vạt cài cúc suốt từ cổ xuống bụng; cổ tròn hoặc cổ tim; dáng áo ôm nhẹ theo thân nhưng không chiết eo gắt; tà xẻ cao vừa phải ở hai bên hông; có 2 túi vuông lớn phía trước; mặc kèm quần lụa/satin ống suông đen hoặc trắng.",
    usage_context: "Sinh hoạt đời thường miền Tây Nam Bộ, chợ nổi, lễ hội miệt vườn, biểu diễn đờn ca tài tử, tiếp đón khách du lịch trải nghiệm.",
    colors: "Đời thường mặc màu sẫm (đen, nâu nhuộm vỏ trâm bầu để chống bám phèn); dịp lễ tiệc dùng lụa màu mạ non, vàng nghệ, hồng phấn, tím cà.",
    accessories: "Khăn rằn Nam Bộ, nón lá, guốc mộc đơn giản, tóc thắt bím hoặc búi thấp.",
    significance: "Đại diện cho tính cách hào sảng, phóng khoáng, chất phác và mộc mạc của con người vùng đất phù sa sông Cửu Long.",
    notes: "Không nên may chít eo quá sát hoặc dùng vải xuyên thấu làm mất đi tinh thần thanh thoát, tự nhiên nguyên bản.",
    references: "Văn hóa Nam Bộ qua lăng kính trang phục (Sơn Nam); Lịch sử trang phục phương Nam (Nghiên cứu văn hóa dân gian).",
    type: "top",
    category: "top",
    gender: "unisex",
    formality: "casual",
    image_url: "assets/top/v04.jpg",
    has_gender_variants: true
  },
  {
    id: "V05",
    name: "Áo ngũ thân tay chẽn",
    origin: "Định hình từ cuộc cải cách trang phục của chúa Nguyễn Phúc Khoát ở Đàng Trong năm 1744, sau đó trở thành quốc phục chuẩn mực của triều Nguyễn từ thời vua Minh Mạng (1827–1837).",
    characteristics: "Thân áo ghép từ 5 khổ vải (2 thân trước, 2 thân sau, 1 thân con bên trong); phom suông đứng, không chít eo; cổ đứng cao ôm khép kín chân cổ; cài 5 khuy bên ngón phải; ống tay bó thon gọn từ khuỷu tay xuống cổ tay. Mặc cùng quần trắng (hoặc quần cùng màu) đáy rộng.",
    usage_context: "Sự kiện học thuật, hội thảo văn hóa, công sở, đi dạy học, chụp ảnh ngoại cảnh, lễ tết, sự kiện ngoại giao giao lưu văn hóa trẻ.",
    colors: "Nam giới thường mặc màu trầm, trung tính (xanh thẫm, đen, nâu, đỏ đun); nữ giới mặc các tông trang nhã (hồng đào, vàng hoa cúc, xanh ngọc, hoa văn dệt chìm).",
    accessories: "Khăn vấn (khăn đóng) chữ Nhân hoặc chữ Nhất, quạt xếp, đồng hồ đeo tay cổ điển, giày tây (nam), hài nhung hoặc guốc mộc.",
    significance: "5 thân áo tượng trưng cho 'tứ thân phụ mẫu' bảo bọc bản thân; 5 cúc tượng trưng cho ngũ thường (Nhân - Lễ - Nghĩa - Trí - Tín) hoặc ngũ luân; thể hiện sự tề chỉnh, nho nhã và giữ gìn lễ tiết.",
    notes: "Cổ áo phải thẳng đứng và ôm khít chân cổ; tà áo khi đứng buông thẳng nếp (dáng chữ A cân đối), không mặc xộc xệch hay để hở cổ bên trong (thường mặc kèm áo lót trắng/áo đơn bên trong).",
    references: "Khảo cứu trang phục triều Nguyễn (Trần Đình Sơn); Ngàn năm áo mũ (Trần Quang Đức).",
    type: "outer",
    category: "outer_traditional",
    gender: "unisex",
    formality: "traditional",
    image_url: "assets/outer_traditional/v05.jpg",
    has_gender_variants: true
  },
  {
    id: "V06",
    name: "Áo tấc (Áo ngũ thân tay thụng)",
    origin: "Lễ phục trang trọng thời Nguyễn (thế kỷ 19 – giữa thế kỷ 20), dùng cho mọi tầng lớp từ vua quan đến thứ dân trong các nghi lễ lớn.",
    characteristics: "Có cấu tạo thân và cổ đứng 5 khuy giống hệt áo ngũ thân tay chẽn, nhưng phần ống tay may thụng to bản (rộng từ 30–50 cm), chiều dài tay buông dài qua đầu ngón tay. Khi người mặc buông tay, tà tay rủ thẳng; khi khoanh tay chắp trước ngực tạo thành khung chữ nhật trang trọng.",
    usage_context: "Lễ tốt nghiệp đại học, bái đường hôn lễ, lễ tế đình/tổ tiên, viếng đền miếu, các sự kiện ngoại giao văn hóa cấp cao.",
    colors: "Xanh lam, đỏ đô, vàng nhạt, tím Huế, xanh lục ngọc; vải gấm dệt hoa văn chữ thọ, hoa cúc, mây cuộn.",
    accessories: "Khăn vấn chuẩn thức, quạt xếp bằng tre/gỗ, guốc mộc quai nhung hoặc giày thêu cổ.",
    significance: "Biểu thị sự tôn kính tuyệt đối đối với tiền nhân và nghi lễ; tư thế đứng khoanh tay giấu kín bàn tay trong ống thụng thể hiện sự khiêm cung, lễ phép.",
    notes: "Vì tay áo rất rộng và dài, tránh mặc khi phải di chuyển nhiều, chạy việc hậu cần hoặc ngồi ăn tiệc tự chọn (dễ chấm tà tay vào đồ ăn).",
    references: "Đại Nam hội điển sự lệ (Nội các triều Nguyễn); Tài liệu nghiên cứu của Trung tâm Bảo tồn Di tích Cố đô Huế.",
    type: "outer",
    category: "outer_traditional",
    gender: "unisex",
    formality: "formal",
    image_url: "assets/outer_traditional/v06.jpg"
  },
  {
    id: "V07",
    name: "Áo Nhật Bình",
    origin: "Thường phục của bậc Hoàng hậu, Hoàng thái hậu, Công chúa và Cung tần quý tộc triều Nguyễn; được luật định chặt chẽ trong điển chế cung đình.",
    characteristics: "Áo khoác ngoài dáng suông xẻ trước; điểm đặc trưng nhất là dải cổ áo to bản hình chữ nhật viền quanh cổ chạy dài xuống tận ngực; cố định vạt bằng dải vải buộc hoặc kim khánh/kim bội; tay áo có dải viền ngũ sắc rực rỡ (ngũ hành).",
    usage_context: "Lễ cưới hỏi hiện đại (cô dâu diện đón dâu), chụp ảnh nghệ thuật cưới, các lễ hội tái hiện văn hóa hoàng cung triều Nguyễn.",
    colors: "Cung đình quy định chặt chẽ theo phẩm bậc: Hoàng hậu dùng màu vàng chính sắc/cam; Công chúa dùng màu đỏ trần; Cung tần dùng màu tím, lục. Hiện nay ứng dụng linh hoạt hơn nhưng chủ yếu là đỏ, xanh, vàng, trắng.",
    accessories: "Khăn vành dây quấn nhiều vòng (hoặc khăn vấn), hài thêu phượng, hoa tai hạt ngọc, kiềng ngọc/kim khánh.",
    significance: "Biểu trưng cho sự quyền quý, đức hạnh và quy chuẩn lễ nghi chuẩn mực cao nhất của nữ giới chốn cung đình xưa.",
    notes: "Cần phân biệt rõ hoa văn và màu sắc giữa phẩm bậc xưa để không lạm dụng hoa văn rồng 5 móng; trang sức đi kèm cần tinh xảo, tránh các loại mấn đính cườm lòe loẹt kiểu sân khấu thị trường.",
    references: "Đại Nam thực lục (Quốc sử quán triều Nguyễn); Trang phục cung đình triều Nguyễn (Bảo tàng Cổ vật Cung đình Huế).",
    type: "outer",
    category: "outer_formal",
    gender: "female",
    formality: "formal",
    image_url: "assets/outer_formal/v07.jpg"
  },
  {
    id: "V08",
    name: "Áo Giao Lĩnh (Trực lĩnh vạt chéo)",
    origin: "Một trong những dạng cổ phục lâu đời nhất của người Việt, thịnh hành từ thời Lý, Trần, đạt đỉnh cao vào thời Lê sơ và Lê trung hưng (thế kỷ 15 – 18).",
    characteristics: "Cổ áo may nẹp thẳng nhưng khi mặc bắt chéo vạt bên trái đè lên vạt bên phải (tả nhẫm/hữu nhẫm), tạo thành đường viền cổ chữ V trước ngực; tay áo có thể là tay chẽn hoặc thụng lớn; cố định ngang eo bằng dây đai lụa buộc thắt.",
    usage_context: "Các sự kiện phục dựng lịch sử thời Lê, hội thảo học thuật cổ điển, biểu diễn nghi lễ cổ, chụp ảnh nghệ thuật điện ảnh cổ trang.",
    colors: "Thời Lê chuộng các màu tự nhiên: đỏ tía, xanh chàm, trắng ngà, vàng nhạt, đen, xanh rêu.",
    accessories: "Mũ tú tài, cân đai, dải ngọc bội (nếu là quý tộc), hài mũi cong, trâm gỗ/bạc.",
    significance: "Thể hiện trật tự văn hóa Nho giáo thời thịnh trị; phản ánh chiều sâu nghìn năm của văn minh Đại Việt trước thời kỳ áo cổ đứng thịnh hành.",
    notes: "Cực kỳ chú ý chiều vắt chéo cổ áo: luôn luôn vắt vạt trái đè lên phải (văn hóa người sống); tuyệt đối không vắt ngược lại (phải đè trái - theo phong tục cổ dùng cho người đã khuất).",
    references: "Ngàn năm áo mũ (Trần Quang Đức); Lịch triều hiến chương loại chí (Phan Huy Chú).",
    type: "outer",
    category: "outer_traditional",
    gender: "unisex",
    formality: "traditional",
    image_url: "assets/outer_traditional/v08.jpg",
    has_gender_variants: true
  },
  {
    id: "V09",
    name: "Áo Viên Lĩnh (Cổ tròn)",
    origin: "Phẩm phục quan lại và trang phục thịnh hành của nam giới từ thời Lý, Trần đến Lê; có nguồn gốc giao lưu văn hóa khu vực Đông Á cổ đại.",
    characteristics: "Cổ áo khoét tròn khép kín quanh chân cổ, cố định bằng nút cài bên vai phải; tay áo thường may thụng rộng; thân áo dài thụng phủ qua gối; ngực áo quan lại thường đính bổ tử (tấm thêu hình chim hoặc thú định phẩm trật).",
    usage_context: "Tế lễ thần linh/thành hoàng làng truyền thống, triển lãm phục dựng phục chế lịch sử, diễn xướng nghi thức lễ nghi cung đình thời Lê.",
    colors: "Phẩm cấp cao màu đỏ tươi, tím; phẩm cấp trung màu xanh lam; thường dân/nho sinh màu trầm, xanh sẫm hoặc trắng.",
    accessories: "Mũ Phốc Đầu (Ô sa mạo), đai lưng to bản (đai da/đai ngọc), hia đen mũi hếch, hốt ngà hoặc quạt lông.",
    significance: "Tượng trưng cho trật tự quy củ, sự uy nghiêm và cương vị quan chức, học vấn trong hệ thống nhà nước pháp quyền phong kiến Đại Việt xưa.",
    notes: "Đây phần lớn là phẩm phục quan lại; người mặc hiện nay cần hiểu rõ quy chuẩn bổ tử thêu trên ngực áo, tránh đính hình thêu sai phẩm hàm hoặc dùng đồ mô phỏng rẻ tiền.",
    references: "Khâm định Việt sử thông giám cương mục; Bản vẽ phục dựng của các hội nhóm nghiên cứu (Đại Việt Cổ Phong, Vietnam Centre).",
    type: "outer",
    category: "outer_traditional",
    gender: "unisex",
    formality: "formal",
    image_url: "assets/outer_traditional/v09.jpg",
    has_gender_variants: true
  },
  {
    id: "V10",
    name: "Áo Đối Khâm",
    origin: "Thịnh hành vào thời Lý - Trần - Hậu Lê; thường dùng làm áo khoác ngoài cho cả nam lẫn nữ, từ quý tộc tới dân gian.",
    characteristics: "Hai vạt áo phía trước may đối xứng song song, buông thẳng thả dọc theo hai bên thân chứ không vắt chéo qua nhau; không cài cúc giữa ngực mà để lộ lớp áo lót bên trong (như yếm hoặc giao lĩnh lót); ống tay thường rộng và suông rủ.",
    usage_context: "Lễ hội thời trang cổ phục, các buổi trình diễn nghệ thuật, chụp ảnh phong cách cổ phong.",
    colors: "Thường phối màu đối lập giữa áo khoác ngoài và áo trong (ngoài xanh - trong hồng, ngoài đỏ đun - trong trắng ngà) tạo tầng lớp thị giác.",
    accessories: "Dây đai lụa buộc lơi quanh eo, ngọc bội thả rủ, trâm cài tóc hoa kim loại, hài nhung.",
    significance: "Biểu hiện của sự thanh thoát, tự do, phóng khoáng trong mỹ cảm trang phục của người xưa; tạo cảm giác nhẹ nhàng, bay bổng.",
    notes: "Cần mặc lớp áo trong (yếm hoặc áo lót kín đáo) cẩn thận vì hai vạt áo khoác ngoài không khép kín, rất dễ hở nếu di chuyển nhanh hoặc trước gió lớn.",
    references: "Bản thảo nghiên cứu cổ phục Đại Việt; Các hiện vật lăng mộ thời Hậu Lê tại Bảo tàng Lịch sử Quốc gia.",
    type: "outer",
    category: "outer_formal",
    gender: "unisex",
    formality: "formal",
    image_url: "assets/outer_formal/v10.jpg"
  },
  {
    id: "v11",
    name: "Hài nhung",
    origin: "Hài nhung thuộc nhóm giày dép truyền thống có hình thức trang trọng, từng hiện diện trong hệ thống trang phục truyền thống và trang phục lễ nghi của người Việt, đặc biệt trong môi trường cung đình và tầng lớp có địa vị.",
    characteristics: "Dạng giày thấp, thường kín phần mũi và thân bàn chân; chất liệu mềm như nhung hoặc vải dày; đế thấp hoặc tương đối phẳng. Có thể được trang trí bằng chỉ thêu, hoa văn hoặc các họa tiết truyền thống.",
    usage_context: "Lễ nghi truyền thống, các dịp trang trọng, biểu diễn cổ phục, tái hiện trang phục lịch sử, lễ hội văn hóa và các hoạt động nghệ thuật mang yếu tố truyền thống.",
    colors: [
      "Đỏ",
      "Đỏ son",
      "Tím",
      "Xanh lam",
      "Xanh lục",
      "Đen",
      "Màu trầm"
    ],
    accessories: [
      "Áo ngũ thân",
      "Áo tấc",
      "Áo Nhật Bình",
      "Áo dài",
      "Trang phục truyền thống"
    ],
    significance: "Thể hiện sự trang trọng, chỉn chu và tính lễ nghi; góp phần hoàn thiện tổng thể hình ảnh của người mặc trong trang phục truyền thống.",
    notes: "Không nên sử dụng hài nhung như một loại giày hiện đại cho mọi hoàn cảnh. Khi phối với cổ phục cần chú ý đến thời kỳ, địa vị và giới tính của người mặc để tránh kết hợp tùy tiện giữa các hệ trang phục.",
    references: [
      "Ngàn năm áo mũ – Trần Quang Đức",
      "Trang phục Việt Nam – Đoàn Thị Tình",
      "Tư liệu về Việt phục và trang phục cung đình Việt Nam"
    ],
    type: "shoes",
    category: "traditional_footwear",
    gender: "female",
    formality: "Formal",
    image_url: "assets/traditional_footwear/v11.jpg"
  },
  {
    id: "v12",
    name: "Hài cung đình",
    origin: "Hài cung đình là nhóm giày dép mang tính nghi lễ gắn với môi trường cung đình Việt Nam, đặc biệt trong bối cảnh triều Nguyễn. Hình thức và mức độ trang trí có sự phân biệt theo thân phận, nghi lễ và loại trang phục đi kèm.",
    characteristics: "Thường có dáng kín chân, đế thấp và cấu tạo tương đối gọn. Có thể sử dụng chất liệu cao cấp và được trang trí bằng thêu, hoa văn hoặc các mô-típ mang tính nghi lễ. Một số loại có mũi cong hoặc hình dáng đặc trưng của giày hài truyền thống.",
    usage_context: "Không gian cung đình, nghi lễ triều đình, các dịp đại lễ và những hoàn cảnh có quy định chặt chẽ về trang phục. Ngày nay chủ yếu xuất hiện trong bảo tồn, phục dựng Việt phục, bảo tàng, sân khấu và các hoạt động văn hóa.",
    colors: [
      "Đỏ",
      "Vàng",
      "Đen",
      "Xanh",
      "Màu đậm"
    ],
    accessories: [
      "Áo Nhật Bình",
      "Áo tấc",
      "Áo ngũ thân",
      "Lễ phục cung đình"
    ],
    significance: "Thể hiện tính nghi lễ, địa vị và sự trang trọng trong văn hóa cung đình; đồng thời phản ánh sự phát triển của kỹ thuật dệt, thêu và chế tác phụ kiện trong lịch sử Việt Nam.",
    notes: "Không nên xem mọi loại hài cổ truyền là hài cung đình. Khi sử dụng trong dataset phục dựng lịch sử, nên xác định rõ hài thuộc bối cảnh cung đình hay dân gian và tránh gán các hoa văn biểu tượng cho hoàng tộc nếu không có căn cứ.",
    references: [
      "Ngàn năm áo mũ – Trần Quang Đức",
      "Trang phục Việt Nam – Đoàn Thị Tình",
      "Tư liệu về trang phục triều Nguyễn và di sản cung đình Huế"
    ],
    type: "shoes",
    category: "traditional_footwear",
    gender: "unisex",
    formality: "Formal",
    image_url: "assets/traditional_footwear/v12.jpg",
    has_gender_variants: true
  },
  {
    id: "v13",
    name: "Guốc mộc",
    origin: "Guốc mộc có lịch sử lâu đời trong đời sống người Việt. Trước khi giày dép hiện đại phổ biến, tre và gỗ là những vật liệu quen thuộc để chế tác guốc. Guốc gỗ mũi cong, quai bằng mây hoặc dây vải từng được sử dụng trong đời sống thường ngày và các dịp hội hè.",
    characteristics: "Thân guốc được đẽo từ gỗ thành một đế cứng, thường có phần mũi hơi cong lên. Guốc truyền thống có thể có quai bằng mây, vải hoặc các vật liệu khác. Một số guốc nữ được tạo độ lõm nhẹ ở phần giữa để ôm bàn chân; guốc nam thường có dáng thẳng và rộng hơn.",
    usage_context: "Đời sống thường ngày, đi chợ, đi hội, đi lễ và các sinh hoạt dân gian. Trong thế kỷ XX, guốc mộc còn trở thành phụ kiện thời trang phổ biến khi phối cùng áo dài, đặc biệt ở đô thị miền Nam. Ngày nay còn được sử dụng trong sân khấu, phim ảnh và các hoạt động tái hiện văn hóa.",
    colors: [
      "Màu gỗ tự nhiên",
      "Vàng nâu",
      "Nâu",
      "Đen"
    ],
    accessories: [
      "Áo dài",
      "Áo bà ba",
      "Áo the",
      "Khăn đóng",
      "Trang phục truyền thống",
      "Trang phục hoài cổ"
    ],
    significance: "Là một hình ảnh quen thuộc gắn với đời sống và thẩm mỹ truyền thống của người Việt. Khi phối với áo dài, guốc mộc góp phần tạo nên hình ảnh giản dị, duyên dáng và mang tính hoài niệm.",
    notes: "Đế gỗ cứng và có thể phát ra tiếng khi bước đi; không phù hợp với các hoạt động cần di chuyển nhanh hoặc địa hình trơn trượt. Khi phối cổ phục nên lựa chọn kiểu guốc phù hợp với thời kỳ và hoàn cảnh thay vì sử dụng mọi kiểu guốc cho mọi loại trang phục.",
    references: [
      "Trang phục Việt Nam – Đoàn Thị Tình",
      "Tư liệu về guốc mộc Việt Nam",
      "Cục Du lịch Quốc gia Việt Nam và các tư liệu về nghề làm guốc mộc"
    ],
    type: "shoes",
    category: "traditional_footwear",
    gender: "unisex",
    formality: "Casual",
    image_url: "assets/traditional_footwear/v13.jpg"
  }
];

// DỮ LIỆU ĐỒ HIỆN ĐẠI (CASUAL ITEMS)
export const CASUAL_ITEMS: CasualItem[] = [
  { id: "cs_01", name: "Quần Jeans ống rộng (Wide-leg Jeans)", type: "bottom", category: "bottom_pants", gender: "male", formality: "casual", silhouette: "Rộng", image_url: "assets/bottom_pants/CS_01.png" },
  { id: "cs_02", name: "Quần Skinny Jeans", type: "bottom", category: "bottom_pants", gender: "female", formality: "casual", silhouette: "Ôm", image_url: "assets/bottom_pants/CS_02.png" },
  { id: "cs_03", name: "Quần Tây ống suông (Tailored Trousers)", type: "bottom", category: "bottom_pants", gender: "unisex", formality: "smart-casual", silhouette: "Rộng", image_url: "assets/bottom_pants/CS_03.png" },
  { id: "cs_04", name: "Quần Culottes lụa/đũi", type: "bottom", category: "bottom_pants", gender: "unisex", formality: "smart-casual", silhouette: "Rộng", image_url: "assets/bottom_pants/CS_04.png" },
  { id: "cs_05", name: "Quần Shorts cạp cao", type: "bottom", category: "bottom_pants", gender: "unisex", formality: "casual", silhouette: "Rộng", image_url: "assets/bottom_pants/CS_05.png" },
  { id: "cs_06", name: "Chân váy chữ A (A-line Skirt)", type: "bottom", category: "bottom_skirt", gender: "female", formality: "casual", silhouette: "Xòe", image_url: "assets/bottom_skirt/CS_06.png" },
  { id: "cs_07", name: "Chân váy Maxi xếp ly (Pleated Maxi Skirt)", type: "bottom", category: "bottom_skirt", gender: "female", formality: "smart-casual", silhouette: "Xòe", image_url: "assets/bottom_skirt/CS_07.png" },
  { id: "cs_08", name: "Chân váy bút chì (Pencil Skirt)", type: "bottom", category: "bottom_skirt", gender: "female", formality: "formal", silhouette: "Ôm", image_url: "assets/bottom_skirt/CS_08.png" },
  { id: "cs_09", name: "Chân váy xòe bồng Tulle", type: "bottom", category: "bottom_skirt", gender: "female", formality: "smart-casual", silhouette: "Xòe", image_url: "assets/bottom_skirt/CS_09.png" },
  { id: "cs_10", name: "Áo phông trắng basic (White T-shirt)", type: "inner", category: "inner", gender: "unisex", formality: "casual", silhouette: "Rộng", image_url: "assets/inner/CS_10.png" },
  { id: "cs_11_1", name: "Áo cổ lọ ôm sát (Turtleneck Top)", type: "inner", category: "inner", gender: "male", formality: "smart-casual", silhouette: "Ôm", image_url: "assets/inner/CS_11_1.png" },
  { id: "cs_11_2", name: "Áo cổ lọ ôm sát (Turtleneck Top)", type: "inner", category: "inner", gender: "female", formality: "smart-casual", silhouette: "Ôm", image_url: "assets/inner/CS_11_2.png" },
  { id: "cs_12", name: "Áo hai dây lụa (Silk Camisole)", type: "inner", category: "inner", gender: "female", formality: "smart-casual", silhouette: "Ôm", image_url: "assets/inner/CS_12.png" },
  { id: "cs_13_1", name: "Áo sơ mi trắng dáng suông (Relaxed Shirt)", type: "inner", category: "inner", gender: "male", formality: "smart-casual", silhouette: "Rộng", image_url: "assets/inner/CS_13_1.png" },
  { id: "cs_13_2", name: "Áo sơ mi trắng dáng suông (Relaxed Shirt)", type: "inner", category: "inner", gender: "female", formality: "smart-casual", silhouette: "Rộng", image_url: "assets/inner/CS_13_2.png" },
  { id: "cs_14", name: "Sneaker trắng tối giản (Minimalist White Sneaker)", type: "shoes", category: "shoes", gender: "unisex", formality: "casual", silhouette: "Ôm", image_url: "assets/shoes/CS_14.png" },
  { id: "cs_15", name: "Giày Loafer da cổ điển", type: "shoes", category: "shoes", gender: "unisex", formality: "smart-casual", silhouette: "Ôm", image_url: "assets/shoes/CS_15.png" },
  { id: "cs_16", name: "Giày Mary Jane gót thấp", type: "shoes", category: "shoes", gender: "female", formality: "smart-casual", silhouette: "Ôm", image_url: "assets/shoes/CS_16.png" },
  { id: "cs_17", name: "Giày cao gót quai mảnh (Strappy Heels)", type: "shoes", category: "shoes", gender: "female", formality: "formal", silhouette: "Ôm", image_url: "assets/shoes/CS_17.png" },
  { id: "cs_18", name: "Sandal bệt dây mảnh (Slide/Strappy Sandals)", type: "shoes", category: "shoes", gender: "female", formality: "casual", silhouette: "Ôm", image_url: "assets/shoes/CS_18.png" },
  { id: "cs_19_1", name: "Quần ống loe cạp cao (Flared Trousers)", type: "bottom", category: "bottom_pants", gender: "male", formality: "smart-casual", silhouette: "Xòe", image_url: "assets/bottom_pants/CS_19_1.png" },
  { id: "cs_19_2", name: "Quần ống loe cạp cao (Flared Trousers)", type: "bottom", category: "bottom_pants", gender: "female", formality: "smart-casual", silhouette: "Xòe", image_url: "assets/bottom_pants/CS_19_2.png" },
  { id: "cs_20", name: "Quần Linen ống suông rộng", type: "bottom", category: "bottom_pants", gender: "unisex", formality: "casual", silhouette: "Rộng", image_url: "assets/bottom_pants/CS_20.png" },
  { id: "cs_21", name: "Quần Bermuda Shorts may đo", type: "bottom", category: "bottom_pants", gender: "unisex", formality: "smart-casual", silhouette: "Rộng", image_url: "assets/bottom_pants/CS_21.png" },
  { id: "cs_22", name: "Chân váy lụa Satin dáng suông (Slip Skirt)", type: "bottom", category: "bottom_skirt", gender: "female", formality: "smart-casual", silhouette: "Ôm", image_url: "assets/bottom_skirt/CS_22.png" },
  { id: "cs_23", name: "Chân váy quấn (Wrap Skirt)", type: "bottom", category: "bottom_skirt", gender: "female", formality: "casual", silhouette: "Xòe", image_url: "assets/bottom_skirt/CS_23.png" },
  { id: "cs_24", name: "Chân váy xếp tầng Boho (Tiered Skirt)", type: "bottom", category: "bottom_skirt", gender: "female", formality: "casual", silhouette: "Xòe", image_url: "assets/bottom_skirt/CS_24.png" },
  { id: "cs_25", name: "Quần Legging trơn tối màu", type: "bottom", category: "bottom_pants", gender: "unisex", formality: "casual", silhouette: "Ôm", image_url: "assets/bottom_pants/CS_25.png" },
  { id: "cs_26", name: "Quần Baggy Kaki", type: "bottom", category: "bottom_pants", gender: "unisex", formality: "casual", silhouette: "Rộng", image_url: "assets/bottom_pants/CS_26.png" },
  { id: "cs_27", name: "Áo quây dệt kim / Chun ngực (Tube Top)", type: "inner", category: "inner", gender: "female", formality: "casual", silhouette: "Ôm", image_url: "assets/inner/CS_27.png" },
  { id: "cs_28", name: "Áo Bodysuit cổ thuyền", type: "inner", category: "inner", gender: "female", formality: "smart-casual", silhouette: "Ôm", image_url: "assets/inner/CS_28.png" },
  { id: "cs_29_1", name: "Áo Tank top gân tăm (Ribbed Tank Top)", type: "inner", category: "inner", gender: "male", formality: "casual", silhouette: "Ôm", image_url: "assets/inner/CS_29_1.png" },
  { id: "cs_29_2", name: "Áo Tank top gân tăm (Ribbed Tank Top)", type: "inner", category: "inner", gender: "female", formality: "casual", silhouette: "Ôm", image_url: "assets/inner/CS_29_2.png" },
  { id: "cs_30", name: "Áo Corset ren / Satin cách điệu", type: "inner", category: "inner", gender: "female", formality: "smart-casual", silhouette: "Ôm", image_url: "assets/inner/CS_30.png" },
  { id: "cs_31", name: "Áo dệt kim cộc tay mỏng (Fine-knit Top)", type: "inner", category: "inner", gender: "unisex", formality: "smart-casual", silhouette: "Ôm", image_url: "assets/inner/CS_31.png" },
  { id: "cs_32", name: "Áo sơ mi cổ tàu tối giản (Mandarin Collar Shirt)", type: "inner", category: "inner", gender: "unisex", formality: "smart-casual", silhouette: "Rộng", image_url: "assets/inner/CS_32.png" },
  { id: "cs_33", name: "Giày búp bê Ballet flats đính nơ", type: "shoes", category: "shoes", gender: "female", formality: "casual", silhouette: "Ôm", image_url: "assets/shoes/CS_33.png" },
  { id: "cs_34", name: "Giày Mule hở gót mũi nhọn", type: "shoes", category: "shoes", gender: "female", formality: "smart-casual", silhouette: "Ôm", image_url: "assets/shoes/CS_34.png" },
  { id: "cs_35", name: "Guốc mộc cao gót (Clogs/Block Heel Mules)", type: "shoes", category: "shoes", gender: "unisex", formality: "casual", silhouette: "Ôm", image_url: "assets/shoes/CS_35.png" },
  { id: "cs_36", name: "Boot cổ thấp da lì (Ankle Boots)", type: "shoes", category: "shoes", gender: "unisex", formality: "smart-casual", silhouette: "Ôm", image_url: "assets/shoes/CS_36.png" },
  { id: "cs_37", name: "Giày Oxford cổ điển", type: "shoes", category: "shoes", gender: "unisex", formality: "formal", silhouette: "Ôm", image_url: "assets/shoes/CS_37.png" },
  { id: "cs_38", name: "Dép cói bệt dạo phố (Espadrilles/Straw Slides)", type: "shoes", category: "shoes", gender: "unisex", formality: "casual", silhouette: "Ôm", image_url: "assets/shoes/CS_38.png" }
];

export const CONTEXTS: ContextItem[] = [
  {
    id: 'C05',
    name: 'Chốn linh thiêng (Đền, Chùa, Miếu, Lăng Tẩm)',
    description: 'Không gian tôn nghiêm, thờ tự tổ tiên và danh nhân văn hóa. Yêu cầu trang phục kín đáo, trang trọng.',
    is_sacred: true
  },
  {
    id: 'C01',
    name: 'Dạo phố & Không gian công cộng đương đại',
    description: 'Phố đi bộ, quán cà phê nghệ thuật, triển lãm và tuần lễ thời trang sáng tạo.',
    is_sacred: false
  },
  {
    id: 'C02',
    name: 'Lễ hội & Sự kiện văn hóa nghệ thuật',
    description: 'Sân khấu biểu diễn, sự kiện giao lưu văn hóa trong và ngoài nước.',
    is_sacred: false
  },
  {
    id: 'C03',
    name: 'Sự kiện trang trọng (Đám cưới, Kỷ niệm)',
    description: 'Những sự kiện yêu cầu tính thẩm mỹ, sang trọng và tôn trọng văn hóa.',
    is_sacred: false
  },
  {
    id: 'C04',
    name: 'Sự kiện học thuật, Hội thảo quốc tế',
    description: 'Yêu cầu trang phục thể hiện sự chuyên nghiệp, chuẩn mực và tri thức.',
    is_sacred: false
  },
  {
    id: 'C06',
    name: 'Concept Chụp ảnh Nghệ thuật',
    description: 'Linh hoạt thể hiện sự sáng tạo và tính nghệ thuật của người mặc.',
    is_sacred: false
  }
];

export const OUTFIT_COMBINATIONS: OutfitCombination[] = [
  {
    id: 'OF_01',
    name: 'Tân Thời Xuống Phố',
    concept_tagline: 'Sự giao thoa giữa nét thanh lịch của áo dài tân thời và sự phóng khoáng đương đại của quần denim ống rộng.',
    garment_id: 'V01',
    casual_item_ids: ['cs_01'],
    style_notes: 'Thay vì quần lụa phi bóng truyền thống, bản phối sử dụng quần jeans ống rộng cạp cao tôn dáng tà áo dài.',
    occasion: 'Dạo phố cuối tuần, Cafe nghệ thuật, Triển lãm bảo tàng',
    image_mockup: '/assets/outfits/of_01.png',
    tags: ['Áo dài tân thời', 'Denim remix', 'Streetwear', 'Gen Z Việt Phục'],
    vibe_rating: 5
  }
];