import { ContractTemplate } from '../types';

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'housing-rental',
    title: 'Hợp đồng thuê nhà trọ & chung cư',
    subtitle: 'Tiền cọc, điện nước niêm yết, quyền riêng tư và bàn giao.',
    category: 'housing',
    featured: true,
    description:
      'Hợp đồng thuê phòng trọ, căn hộ mini và chung cư cho sinh viên — bảo đảm quyền lợi tiền cọc, giá điện nước chuẩn nhà nước và điều kiện trả phòng.',
    tags: ['Tiền cọc', 'Điện nước niêm yết', 'Thời gian báo trước', 'Biên bản bàn giao'],
    riskCount: 3,
    sourceUrls: [
      {
        title: 'Mẫu hợp đồng thuê nhà ở (Thư viện Pháp luật)',
        url: 'https://thuvienphapluat.vn/hopdong?type=16',
        note: 'Mẫu nền chuẩn cho thuê phòng trọ và nhà ở dân sinh.',
      },
      {
        title: 'Mẫu hợp đồng thuê nhà chung cư mới nhất 2026 (File Word/PDF)',
        url: 'https://thuvienphapluat.vn/phap-luat/mau-hop-dong-thue-nha-chung-cu-nam-2026-day-du-nhat-ra-sao-tai-file-word-mau-hop-dong-thue-nha-chun-268632-259341.html',
        note: 'Có link tải file văn bản gốc, đầy đủ phụ lục bàn giao.',
      },
      {
        title: 'Chuyên đề pháp lý hợp đồng thuê nhà & tiền đặt cọc',
        url: 'https://thuvienphapluat.vn/phap-luat/chu-de/hop-dong-thue-nha',
        note: 'Kiểm tra quyền, nghĩa vụ, cọc và chấm dứt hợp đồng trước hạn.',
      },
      {
        title: 'Mẫu hợp đồng thuê căn hộ theo Nghị định 96/2024/NĐ-CP',
        url: 'https://thuvienphapluat.vn/hoi-dap-phap-luat/mau-hop-dong-thue-mua-can-ho-chung-cu-tu-0182024-theo-nghi-dinh-96-138033776.html',
        note: 'Mẫu chuẩn theo Luật Nhà ở 2023 và Nghị định hướng dẫn.',
      },
    ],
    clauses: [
      {
        title: 'Điều 1: Tiền đặt cọc và hoàn trả',
        content:
          'Bên thuê đặt cọc 2 tháng tiền phòng. Trong mọi trường hợp bên thuê chấm dứt hợp đồng trước hạn, bên cho thuê có quyền tịch thu 100% tiền đặt cọc mà không cần lý do.',
        isRisky: true,
        clauseRiskScore: 90,
        riskReason:
          'Tịch thu tiền cọc bất kể trường hợp nào (kể cả lỗi bên cho thuê) là điều khoản đơn phương bất lợi.',
        advice:
          'Nêu rõ: Nếu bên thuê báo trước 30 ngày hoặc do nhà trọ hư hỏng không khắc phục thì bên cho thuê phải hoàn trả lại 100% tiền cọc.',
        lawReference: 'Điều 328 & Điều 472 Bộ luật Dân sự 2015',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Quyen-dan-su/Bo-luat-dan-su-2015-296215.aspx',
      },
      {
        title: 'Điều 2: Đơn giá điện nước và dịch vụ',
        content:
          'Tiền điện tính 4.500 VNĐ/kWh, tiền nước 100.000 VNĐ/người/tháng. Phí bảo trì và thang máy có thể tăng bất kỳ lúc nào theo thông báo miệng.',
        isRisky: true,
        clauseRiskScore: 78,
        riskReason:
          'Thu tiền điện vượt khung quy định nhà nước và chi phí dịch vụ tăng tùy tiện không văn bản.',
        advice:
          'Giá điện nhà trọ cho sinh viên được áp dụng theo Thông tư 25/2018/TT-BCT & Thông tư 09/2023/TT-BCT. Phí dịch vụ phải niêm yết cố định trong suốt thời hạn hợp đồng.',
        lawReference: 'Thông tư 25/2018/TT-BCT & Nghị định 17/2022/NĐ-CP',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Thuong-mai/Thong-tu-25-2018-TT-BCT-sua-doi-Thong-tu-16-2014-TT-BCT-thuc-hien-gia-ban-dien-394022.aspx',
      },
      {
        title: 'Điều 3: Quyền ra vào và kiểm tra phòng',
        content:
          'Chủ nhà có quyền vào kiểm tra phòng bất cứ lúc nào không cần báo trước để bảo đảm an ninh trật tự.',
        isRisky: true,
        clauseRiskScore: 65,
        riskReason: 'Xâm phạm quyền riêng tư và chỗ ở hợp pháp của người thuê.',
        advice:
          'Bổ sung: Chủ nhà chỉ được vào phòng khi có sự đồng ý của bên thuê hoặc có thông báo trước tối thiểu 24 giờ (trừ trường hợp khẩn cấp như hỏa hoạn).',
        lawReference: 'Điều 22 Hiến pháp 2013 & Điều 132 Luật Nhà ở 2023',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Bat-dong-san/Luat-Nha-o-2023-522234.aspx',
      },
      {
        title: 'Điều 4: Biên bản bàn giao trang thiết bị',
        content:
          'Hai bên lập biên bản kiểm kê tình trạng điều hòa, nóng lạnh, giường tủ trước khi nhận phòng. Hao mòn tự nhiên không tính vào chi phí đền bù.',
        isRisky: false,
        clauseRiskScore: 10,
        advice: 'Giúp tránh tranh chấp trừ tiền cọc vô lý khi trả phòng.',
        lawReference: 'Điều 479 & Điều 482 Bộ luật Dân sự 2015',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Quyen-dan-su/Bo-luat-dan-su-2015-296215.aspx',
      },
    ],
  },
  {
    id: 'parttime-work',
    title: 'Việc làm part-time / full-time',
    subtitle: 'Lương, ca làm, thử việc và quyền lợi người lao động.',
    category: 'work',
    featured: true,
    description:
      'Hợp đồng lao động dành cho sinh viên làm thêm quán cafe, trợ giảng, bán hàng hoặc nhân viên thử việc tại doanh nghiệp.',
    tags: ['Lương theo giờ', 'Ca làm linh hoạt', 'Thử việc ≥85%', 'Không giữ lương'],
    riskCount: 3,
    sourceUrls: [
      {
        title: 'Mẫu Hợp đồng thử việc chuẩn Bộ luật Lao động',
        url: 'https://thuvienphapluat.vn/hopdong/36620/HOP-DONG-THU-VIEC',
        note: 'Mẫu văn bản chuẩn cho giai đoạn thử việc, ghi rõ mức lương ≥ 85%.',
      },
      {
        title: 'Danh mục Hợp đồng lao động xác định thời hạn',
        url: 'https://thuvienphapluat.vn/hopdong?type=6',
        note: 'Các mẫu hợp đồng lao động part-time và full-time phổ biến.',
      },
      {
        title: 'Toàn văn Bộ luật Lao động 2019 (Số 45/2019/QH14)',
        url: 'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-Luat-lao-dong-2019-333670.aspx',
        note: 'Căn cứ pháp lý bảo vệ quyền lợi lương, giờ làm thêm và thử việc.',
      },
    ],
    clauses: [
      {
        title: 'Điều 1: Vị trí và thời gian làm việc',
        content:
          'Người lao động làm việc theo ca linh hoạt do Người sử dụng lao động phân công, tối thiểu 20 giờ/tuần. Có thể phải tăng ca đột xuất theo yêu cầu kinh doanh mà không báo trước 24 giờ.',
        isRisky: true,
        clauseRiskScore: 68,
        riskReason:
          'Quy định tăng ca đột xuất không báo trước vi phạm quyền nghỉ ngơi và ảnh hưởng lịch học.',
        advice:
          'Yêu cầu quy định rõ thời gian báo trước lịch ca tối thiểu 3 ngày và mức phụ cấp làm thêm giờ (tối thiểu 150% theo Điều 98 BLLĐ).',
        lawReference: 'Điều 98, Điều 107 Bộ luật Lao động 2019',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-Luat-lao-dong-2019-333670.aspx',
      },
      {
        title: 'Điều 2: Tiền lương và hình thức chi trả',
        content:
          'Mức lương cơ bản là 25.000 VNĐ/giờ. Lương tháng được thanh toán vào ngày 15 của tháng kế tiếp. Công ty có quyền giữ lại 50% lương tháng đầu làm tiền cam kết làm việc tối thiểu 6 tháng.',
        isRisky: true,
        clauseRiskScore: 92,
        riskReason:
          'Việc giữ lương của người lao động để cam kết làm việc là hành vi trái pháp luật nghiêm trọng.',
        advice:
          'Khoản 2 Điều 17 Bộ luật Lao động 2019 nghiêm cấm người sử dụng lao động giữ tiền, tài sản hoặc giấy tờ tùy thân của người lao động để bảo đảm thực hiện hợp đồng.',
        lawReference: 'Điều 17 Bộ luật Lao động 2019 (Hành vi bị cấm)',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-Luat-lao-dong-2019-333670.aspx',
      },
      {
        title: 'Điều 3: Thời gian thử việc',
        content:
          'Thời gian thử việc là 30 ngày. Trong thời gian thử việc, người lao động nhận 70% mức lương chính thức.',
        isRisky: true,
        clauseRiskScore: 75,
        riskReason:
          'Mức lương thử việc theo quy định luật tối thiểu phải bằng 85% mức lương chính thức.',
        advice:
          'Đề nghị điều chỉnh mức lương thử việc lên tối thiểu 85% lương chính thức theo Điều 26 BLLĐ 2019.',
        lawReference: 'Điều 26 Bộ luật Lao động 2019',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-Luat-lao-dong-2019-333670.aspx',
      },
      {
        title: 'Điều 4: Chấm dứt hợp đồng',
        content:
          'Người lao động muốn nghỉ việc phải báo trước bằng văn bản tối thiểu 15 ngày làm việc và bàn giao đầy đủ công việc.',
        isRisky: false,
        clauseRiskScore: 12,
        advice:
          'Điều khoản này phù hợp với hợp đồng lao động xác định thời hạn dưới 12 tháng.',
        lawReference: 'Điều 35 Bộ luật Lao động 2019',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-Luat-lao-dong-2019-333670.aspx',
      },
    ],
  },
  {
    id: 'internship-agreement',
    title: 'Thỏa thuận thực tập sinh (Intern)',
    subtitle: 'Mentor, phụ cấp, dấu mộc báo cáo và cam kết đào tạo.',
    category: 'internship',
    description:
      'Thỏa thuận tiếp nhận thực tập sinh doanh nghiệp, phân định rõ giữa học tập thực tế và làm việc như nhân viên chính thức.',
    tags: ['Mentor hướng dẫn', 'Phụ cấp thực tập', 'Dấu mộc báo cáo', 'Bảo mật NDA'],
    riskCount: 2,
    sourceUrls: [
      {
        title: 'Mẫu đăng ký & Hợp đồng lao động thực tập mới nhất (File tải về)',
        url: 'https://thuvienphapluat.vn/lao-dong-tien-luong/tai-ve-mau-dang-ky-hop-dong-lao-dong-thuc-tap-moi-nhat-hien-nay-o-dau-61611.html',
        note: 'Mẫu đăng ký/hợp đồng thực tập chuẩn, có file tải về.',
      },
      {
        title: 'Mẫu Phương án & Hợp đồng đào tạo bồi dưỡng kỹ năng nghề',
        url: 'https://thuvienphapluat.vn/bieumau/23023/MAU-PHUONG-AN-DAO-TAO-BOI-DUONG-NANG-CAO-TRINH-DO-KY-NANG-NGHE-VA-DUY-TRI-VIEC-LAM-CHO-NGUOI-LAO-DONG',
        note: 'Rà soát kỹ kinh phí đào tạo và cam kết làm việc sau đào tạo.',
      },
      {
        title: 'Mẫu Hợp đồng thử việc (Đối chiếu khi thực tập có trả lương)',
        url: 'https://thuvienphapluat.vn/hopdong/36620/HOP-DONG-THU-VIEC',
        note: 'Không dùng thỏa thuận thực tập để né tránh quyền lợi lao động chính thức.',
      },
    ],
    clauses: [
      {
        title: 'Điều 1: Mục tiêu thực tập & Người hướng dẫn',
        content:
          'Công ty phân công Mentor có chuyên môn hướng dẫn thực tập sinh hoàn thành đề tài tốt nghiệp và làm quen môi trường thực tế.',
        isRisky: false,
        clauseRiskScore: 10,
        advice:
          'Nên ghi rõ tên hoặc chức danh Mentor cùng lịch đánh giá tiến độ định kỳ.',
        lawReference: 'Điều 61 Bộ luật Lao động 2019 (Học nghề, tập nghề)',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-Luat-lao-dong-2019-333670.aspx',
      },
      {
        title: 'Điều 2: Phụ cấp và hỗ trợ chi phí',
        content:
          'Thực tập sinh làm việc 40 giờ/tuần như nhân viên. Phụ cấp thực tập sẽ được xem xét tùy theo kết quả kinh doanh của công ty vào cuối kỳ.',
        isRisky: true,
        clauseRiskScore: 66,
        riskReason:
          'Không cam kết mức phụ cấp cụ thể trong khi yêu cầu khối lượng làm việc toàn thời gian.',
        advice:
          'Khoản 5 Điều 61 BLLĐ 2019 quy định: Nếu người học nghề, tập nghề trực tiếp làm ra sản phẩm hợp quy cách thì phải được trả lương theo thỏa thuận.',
        lawReference: 'Khoản 5 Điều 61 Bộ luật Lao động 2019',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-Luat-lao-dong-2019-333670.aspx',
      },
      {
        title: 'Điều 3: Cam kết đào tạo và phạt bồi thường',
        content:
          'Nếu thực tập sinh không tiếp tục làm việc chính thức tại công ty sau khi tốt nghiệp thì phải bồi thường chi phí đào tạo 15.000.000 VNĐ.',
        isRisky: true,
        clauseRiskScore: 88,
        riskReason:
          'Điều khoản gài bẫy chi phí đào tạo không có chứng từ đào tạo chuyên môn thực tế.',
        advice:
          'Theo Điều 62 BLLĐ, chi phí đào tạo chỉ được yêu cầu bồi thường khi có ký hợp đồng đào tạo nghề riêng và công ty chi trả học phí thực tế kèm hóa đơn hợp lệ.',
        lawReference: 'Điều 62 Bộ luật Lao động 2019',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-Luat-lao-dong-2019-333670.aspx',
      },
      {
        title: 'Điều 4: Xác nhận dấu mộc báo cáo',
        content:
          'Công ty cam kết hỗ trợ xác nhận dấu mộc và cung cấp nhận xét trung thực vào Báo cáo thực tập tốt nghiệp của trường.',
        isRisky: false,
        clauseRiskScore: 8,
        advice: 'Điều khoản chuẩn giúp bảo đảm sinh viên đủ điều kiện tốt nghiệp.',
        lawReference: 'Điều 385 Bộ luật Dân sự 2015 (Khái niệm hợp đồng)',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Quyen-dan-su/Bo-luat-dan-su-2015-296215.aspx',
      },
    ],
  },
  {
    id: 'freelance-contract',
    title: 'Cộng tác viên (CTV) / Freelance',
    subtitle: 'Phạm vi công việc, số vòng sửa bài và mốc thanh toán.',
    category: 'freelance',
    description:
      'Hợp đồng dịch vụ cộng tác viên thiết kế, lập trình, viết content, dịch thuật với các mốc nghiệm thu và bản quyền rõ ràng.',
    tags: ['Mốc nghiệm thu', 'Tạm ứng cọc 30-50%', 'Quyền tác giả', 'Giới hạn vòng sửa'],
    riskCount: 2,
    sourceUrls: [
      {
        title: 'Mẫu Hợp đồng Cộng tác viên mới nhất 2025 (Có file tải về)',
        url: 'https://thuvienphapluat.vn/phap-luat-doanh-nghiep/bai-viet/mau-hop-dong-cong-tac-vien-nam-2025-12572.html',
        note: 'Phân biệt rõ hợp đồng dịch vụ CTV và hợp đồng lao động.',
      },
      {
        title: 'Danh mục Hợp đồng dịch vụ & Phụ lục bảo mật (NDA)',
        url: 'https://thuvienphapluat.vn/hopdong?type=6',
        note: 'Mẫu tham khảo điều khoản nghiệm thu, bảo mật và trách nhiệm vật chất.',
      },
      {
        title: 'Bộ luật Dân sự 2015 — Mục Hợp đồng dịch vụ (Điều 513 - 521)',
        url: 'https://thuvienphapluat.vn/van-ban/Quyen-dan-su/Bo-luat-dan-su-2015-296215.aspx',
        note: 'Quy định pháp lý về nghĩa vụ trả tiền dịch vụ và đơn phương chấm dứt.',
      },
    ],
    clauses: [
      {
        title: 'Điều 1: Phạm vi công việc và số lần chỉnh sửa',
        content:
          'Bên B thực hiện thiết kế bộ nhận diện thương hiệu theo brief. Bên A có quyền yêu cầu chỉnh sửa không giới hạn số lần cho đến khi hoàn toàn hài lòng.',
        isRisky: true,
        clauseRiskScore: 74,
        riskReason:
          'Yêu cầu sửa đổi không giới hạn (infinite revisions) dẫn đến nguy cơ bị bóc lột công sức và trễ tiến độ.',
        advice:
          'Quy định tối đa 2 - 3 vòng chỉnh sửa miễn phí theo brief ban đầu; các chỉnh sửa ngoài phạm vi tính phí bổ sung.',
        lawReference: 'Điều 513 & Điều 517 Bộ luật Dân sự 2015',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Quyen-dan-su/Bo-luat-dan-su-2015-296215.aspx',
      },
      {
        title: 'Điều 2: Tiến độ thanh toán',
        content:
          'Bên B bàn giao toàn bộ file gốc và quyền sở hữu trước. Bên A sẽ tiến hành thanh toán 100% thù lao trong vòng 45 ngày làm việc sau khi nghiệm thu.',
        isRisky: true,
        clauseRiskScore: 80,
        riskReason:
          'Không có tiền tạm ứng và thời gian thanh toán quá dài (45 ngày) sau khi đã giao file gốc.',
        advice:
          'Áp dụng quy tắc chia đợt: Tạm ứng 30-50% khi ký hợp đồng, 30% khi duyệt bản nháp, và 20-40% còn lại trước khi giao file gốc hoàn chỉnh.',
        lawReference: 'Điều 519 Bộ luật Dân sự 2015 (Trả tiền dịch vụ)',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Quyen-dan-su/Bo-luat-dan-su-2015-296215.aspx',
      },
      {
        title: 'Điều 3: Bản quyền và quyền tác giả',
        content:
          'Quyền tác giả nhân thân luôn thuộc về bên sáng tạo. Quyền tài sản chỉ được chuyển giao sau khi bên A đã thanh toán đủ 100% thù lao.',
        isRisky: false,
        clauseRiskScore: 10,
        advice: 'Điều khoản bảo vệ quyền lợi sở hữu trí tuệ rất chuẩn mực.',
        lawReference: 'Điều 19 & Điều 20 Luật Sở hữu trí tuệ',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/So-huu-tri-tue/Luat-So-huu-tri-tue-2005-50-2005-QH11-7022.aspx',
      },
    ],
  },
  {
    id: 'course-agreement',
    title: 'Hợp đồng khóa học & Cam kết đầu ra',
    subtitle: 'Học phí, điều kiện hoàn phí và cam kết việc làm.',
    category: 'education',
    description:
      'Hợp đồng đăng ký khóa học ngoại ngữ, lập trình (bootcamp), kỹ năng nghề có cam kết đầu ra hoặc trả góp học phí.',
    tags: ['Hoàn học phí', 'Cam kết đầu ra', 'Chất lượng giảng dạy', 'Quyền người tiêu dùng'],
    riskCount: 2,
    sourceUrls: [
      {
        title: 'Luật Bảo vệ quyền lợi người tiêu dùng 2023 (Cổng TTĐT Chính phủ)',
        url: 'https://vanban.chinhphu.vn/?classid=1&docid=208363&orggroupid=1&pageid=27160',
        note: 'Đối chiếu quy định về hợp đồng theo mẫu và điều khoản không có hiệu lực.',
      },
      {
        title: 'Mẫu Phương án & Hợp đồng đào tạo bồi dưỡng kỹ năng',
        url: 'https://thuvienphapluat.vn/bieumau/23023/MAU-PHUONG-AN-DAO-TAO-BOI-DUONG-NANG-CAO-TRINH-DO-KY-NANG-NGHE-VA-DUY-TRI-VIEC-LAM-CHO-NGUOI-LAO-DONG',
        note: 'Mẫu tham chiếu các điều khoản lộ trình học và chi phí đào tạo.',
      },
      {
        title: 'Danh mục Hợp đồng cung cấp dịch vụ đào tạo',
        url: 'https://thuvienphapluat.vn/hopdong?type=6',
        note: 'Cần bổ sung rõ lịch học, sĩ số lớp và điều kiện hoàn trả học phí.',
      },
    ],
    clauses: [
      {
        title: 'Điều 1: Chính sách bảo lưu và hoàn trả học phí',
        content:
          'Học phí đã đóng không được hoàn trả dưới bất kỳ hình thức nào, kể cả trường hợp trung tâm thay đổi giảng viên, dời lịch khai giảng hoặc chuyển từ học trực tiếp sang học online.',
        isRisky: true,
        clauseRiskScore: 86,
        riskReason:
          'Loại trừ trách nhiệm của bên cung cấp dịch vụ khi tự ý thay đổi chất lượng/hình thức khóa học.',
        advice:
          'Yêu cầu ghi rõ: Nếu trung tâm lùi lịch quá 14 ngày hoặc thay đổi hình thức học không đúng cam kết ban đầu, học viên có quyền rút học phí 100%.',
        lawReference: 'Điều 25 Luật Bảo vệ quyền lợi người tiêu dùng 2023',
        lawReferenceUrl:
          'https://vanban.chinhphu.vn/?classid=1&docid=208363&orggroupid=1&pageid=27160',
      },
      {
        title: 'Điều 2: Điều kiện cam kết việc làm sau khóa học',
        content:
          'Trung tâm cam kết 100% có việc làm lương từ 15 triệu. Tuy nhiên cam kết bị hủy toàn bộ nếu học viên vắng mặt quá 1 buổi học hoặc nộp bài tập trễ 1 lần trong suốt 6 tháng.',
        isRisky: true,
        clauseRiskScore: 76,
        riskReason:
          'Đặt điều kiện loại trừ cam kết quá khắc nghiệt nhằm vô hiệu hóa trách nhiệm giới thiệu việc làm.',
        advice:
          'Đề nghị quy định tỷ lệ chuyên cần hợp lý (ví dụ: tham gia tối thiểu 85% thời lượng học và đạt bài thi cuối khóa).',
        lawReference: 'Điều 405 & Điều 513 Bộ luật Dân sự 2015',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Quyen-dan-su/Bo-luat-dan-su-2015-296215.aspx',
      },
      {
        title: 'Điều 3: Lộ trình đào tạo và tài liệu học tập',
        content:
          'Trung tâm cung cấp đầy đủ giáo trình, tài khoản thực hành và chứng nhận hoàn thành khóa học theo đúng khung chương trình đính kèm phụ lục.',
        isRisky: false,
        clauseRiskScore: 10,
        advice: 'Nên đính kèm syllabus chi tiết vào phụ lục hợp đồng.',
        lawReference: 'Điều 516 Bộ luật Dân sự 2015',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Quyen-dan-su/Bo-luat-dan-su-2015-296215.aspx',
      },
    ],
  },
  {
    id: 'consumer-loan',
    title: 'Vay tiêu dùng & Mua trả góp',
    subtitle: 'Lãi suất thực tế, phí ẩn, phạt trả trước hạn và bảo mật.',
    category: 'finance',
    description:
      'Hợp đồng mua laptop/xe máy trả góp hoặc vay tiêu dùng sinh viên — cảnh báo lãi suất vượt trần 20%/năm và các loại phí quản lý ẩn.',
    tags: ['Trần lãi suất 20%/năm', 'Phí quản lý khoản vay', 'Phí tất toán sớm', 'Bảo mật danh bạ'],
    riskCount: 2,
    sourceUrls: [
      {
        title: 'Mẫu Hợp đồng vay tài sản chuẩn dân sự',
        url: 'https://thuvienphapluat.vn/hopdong/462/HOP-DONG-VAY-TAI-SAN',
        note: 'Khung hợp đồng vay tài sản, đối chiếu trần lãi suất Điều 468 BLDS.',
      },
      {
        title: 'Thông tư 43/2016/TT-NHNN về cho vay tiêu dùng công ty tài chính',
        url: 'https://thuvienphapluat.vn/van-ban/Tien-te-Ngan-hang/Thong-tu-43-2016-TT-NHNN-cho-vay-tieu-dung-cua-cong-ty-tai-chinh-326281.aspx',
        note: 'Quy định bắt buộc về minh bạch lãi suất, phí phạt và phương thức thu hồi nợ.',
      },
      {
        title: 'Mẫu Hợp đồng cho vay tiền có điều khoản bảo đảm',
        url: 'https://thuvienphapluat.vn/hopdong/533/HOP-DONG-CHO-VAY-TIEN',
        note: 'Kiểm tra kỹ điều khoản tài sản bảo đảm và lịch trả góp hàng tháng.',
      },
    ],
    clauses: [
      {
        title: 'Điều 1: Lãi suất vay và các khoản phí dịch vụ đi kèm',
        content:
          'Lãi suất danh nghĩa là 1.5%/tháng, cộng thêm phí tư vấn hồ sơ 2%/tháng và phí quản lý tài khoản 1.5%/tháng tính trên dư nợ gốc ban đầu.',
        isRisky: true,
        clauseRiskScore: 92,
        riskReason:
          'Lãi suất gộp các loại phí ẩn tính trên dư nợ gốc ban đầu đẩy chi phí vay thực tế vượt xa mức trần 20%/năm.',
        advice:
          'Theo Điều 468 BLDS 2015, lãi suất theo thỏa thuận không được vượt quá 20%/năm của khoản tiền vay (trừ trường hợp luật tổ chức tín dụng có quy định khác nhưng phải minh bạch toàn bộ phí).',
        lawReference: 'Điều 468 Bộ luật Dân sự 2015 & Thông tư 43/2016/TT-NHNN',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Quyen-dan-su/Bo-luat-dan-su-2015-296215.aspx',
      },
      {
        title: 'Điều 2: Quyền truy cập dữ liệu cá nhân và đôn đốc nợ',
        content:
          'Bên vay đồng ý cho bên cho vay truy cập toàn bộ danh bạ điện thoại, mạng xã hội và liên hệ người thân, trường học để nhắc nợ khi quá hạn 1 ngày.',
        isRisky: true,
        clauseRiskScore: 95,
        riskReason:
          'Vi phạm quy định về bảo vệ dữ liệu cá nhân và quy tắc đôn đốc thu hồi nợ của Ngân hàng Nhà nước.',
        advice:
          'Thông tư 18/2019/TT-NHNN nghiêm cấm nhắc nợ người không có nghĩa vụ trả nợ (bạn bè, người thân, trường học) và Nghị định 13/2023/NĐ-CP bảo vệ dữ liệu cá nhân.',
        lawReference: 'Thông tư 18/2019/TT-NHNN & Nghị định 13/2023/NĐ-CP',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Tien-te-Ngan-hang/Thong-tu-18-2019-TT-NHNN-sua-doi-Thong-tu-43-2016-TT-NHNN-cho-vay-tieu-dung-428287.aspx',
      },
      {
        title: 'Điều 3: Bảng minh họa lịch trả nợ và tất toán trước hạn',
        content:
          'Bên cho vay cung cấp bảng kê chi tiết số tiền gốc và lãi phải trả từng kỳ hàng tháng trước khi ký hợp đồng.',
        isRisky: false,
        clauseRiskScore: 15,
        advice: 'Luôn yêu cầu bảng tính tổng số tiền thực trả cuối cùng trước khi đặt bút ký.',
        lawReference: 'Thông tư 43/2016/TT-NHNN',
        lawReferenceUrl:
          'https://thuvienphapluat.vn/van-ban/Tien-te-Ngan-hang/Thong-tu-43-2016-TT-NHNN-cho-vay-tieu-dung-cua-cong-ty-tai-chinh-326281.aspx',
      },
    ],
  },
];
