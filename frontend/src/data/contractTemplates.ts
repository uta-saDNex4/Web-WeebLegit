import { ContractTemplate } from '../types';

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'parttime-work',
    title: 'Việc làm part-time / full-time (CTV)',
    subtitle: 'Lương, ca làm, thử việc và quyền lợi.',
    category: 'work',
    description: 'Hợp đồng lao động & cộng tác viên dành cho sinh viên làm thêm quán cafe, trợ giảng, bán hàng hoặc nhân viên thử việc.',
    tags: ['Lương theo giờ', 'Ca làm linh hoạt', 'Thử việc', 'Phụ cấp'],
    riskCount: 3,
    officialUrl: 'https://thuvienphapluat.vn/lao-dong-tien-luong/tai-ve-mau-hop-dong-cong-tac-vien-moi-nhat-2025-va-huong-dan-chi-tiet-cach-viet-65902.html',
    officialSource: 'Thư viện Pháp luật (Mẫu HĐ CTV 2025)',
    clauses: [
      {
        title: 'Điều 1: Vị trí và thời gian làm việc',
        content: 'Người lao động làm việc theo ca linh hoạt do Người sử dụng lao động phân công, tối thiểu 20 giờ/tuần. Có thể phải tăng ca đột xuất theo yêu cầu kinh doanh mà không báo trước 24 giờ.',
        isRisky: true,
        riskReason: 'Quy định tăng ca đột xuất không báo trước vi phạm quyền nghỉ ngơi và ảnh hưởng lịch học.',
        advice: 'Yêu cầu quy định rõ thời gian báo trước lịch ca tối thiểu 3 ngày và mức phụ cấp làm thêm giờ (tối thiểu 150% theo Điều 98 BLLĐ).',
        lawReference: 'Điều 98, Điều 107 Bộ luật Lao động 2019'
      },
      {
        title: 'Điều 2: Tiền lương và hình thức chi trả',
        content: 'Mức lương cơ bản là 25.000 VNĐ/giờ. Lương tháng được thanh toán vào ngày 15 của tháng kế tiếp. Công ty có quyền giữ lại 50% lương tháng đầu làm tiền cam kết làm việc tối thiểu 6 tháng.',
        isRisky: true,
        riskReason: 'Việc giữ lương của người lao động để cam kết làm việc là hành vi trái pháp luật nghiêm trọng.',
        advice: 'Khoản 2 Điều 17 Bộ luật Lao động 2019 nghiêm cấm người sử dụng lao động giữ tiền, tài sản của người lao động để bảo đảm thực hiện hợp đồng.',
        lawReference: 'Điều 17 Bộ luật Lao động 2019 (Hành vi bị cấm)'
      },
      {
        title: 'Điều 3: Thời gian thử việc',
        content: 'Thời gian thử việc là 30 ngày. Trong thời gian thử việc, người lao động nhận 70% mức lương chính thức.',
        isRisky: true,
        riskReason: 'Mức lương thử việc theo quy định luật tối thiểu phải bằng 85% mức lương chính thức.',
        advice: 'Đề nghị điều chỉnh mức lương thử việc lên tối thiểu 85% lương chính thức theo Điều 26 BLLĐ 2019.',
        lawReference: 'Điều 26 Bộ luật Lao động 2019'
      },
      {
        title: 'Điều 4: Chấm dứt hợp đồng',
        content: 'Người lao động muốn nghỉ việc phải báo trước bằng văn bản tối thiểu 15 ngày làm việc và bàn giao đầy đủ công việc.',
        isRisky: false,
        advice: 'Điều khoản này phù hợp với hợp đồng lao động xác định thời hạn dưới 12 tháng.'
      }
    ]
  },
  {
    id: 'internship-agreement',
    title: 'Thỏa thuận thực tập sinh',
    subtitle: 'Mentor, phụ cấp và mục tiêu công việc.',
    category: 'internship',
    description: 'Thỏa thuận tiếp nhận thực tập sinh doanh nghiệp, phân định rõ giữa học tập thực tế và làm việc như nhân viên chính thức.',
    tags: ['Mentor hướng dẫn', 'Phụ cấp thực tập', 'Dấu mộc báo cáo', 'Bảo mật NDA'],
    riskCount: 2,
    officialUrl: 'https://thuvienphapluat.vn/lao-dong-tien-luong/tai-ve-mau-dang-ky-hop-dong-lao-dong-thuc-tap-moi-nhat-hien-nay-o-dau-61611.html',
    officialSource: 'Thư viện Pháp luật (Mẫu Thực tập sinh)',
    clauses: [
      {
        title: 'Điều 1: Mục tiêu thực tập & Người hướng dẫn',
        content: 'Công ty phân công Mentor có chuyên môn hướng dẫn thực tập sinh hoàn thành đề tài tốt nghiệp và làm quen môi trường thực tế.',
        isRisky: false,
        advice: 'Nên ghi rõ tên hoặc chức danh Mentor cùng lịch đánh giá tiến độ định kỳ.'
      },
      {
        title: 'Điều 2: Cam kết bồi hoàn chi phí đào tạo',
        content: 'Thực tập sinh phải bồi hoàn 15.000.000 VNĐ chi phí đào tạo nếu không tiếp tục ký hợp đồng lao động chính thức tại công ty sau đợt thực tập.',
        isRisky: true,
        riskReason: 'Ép buộc ký hợp đồng lao động bằng cách áp đặt chi phí đào tạo vô căn cứ.',
        advice: 'Chỉ chấp nhận bồi hoàn khi công ty gửi đi đào tạo tại trung tâm/tổ chức có hóa đơn chứng từ cụ thể.',
        lawReference: 'Điều 62 Bộ luật Lao động 2019'
      },
      {
        title: 'Điều 3: Xác nhận báo cáo thực tập',
        content: 'Công ty hỗ trợ nhận xét khách quan và đóng dấu mộc đỏ vào Báo cáo thực tập tốt nghiệp khi kết thúc kỳ thực tập.',
        isRisky: false,
        advice: 'Rất cần thiết để nộp về trường đại học/cao đẳng hoàn thành tín chỉ.'
      }
    ]
  },
  {
    id: 'housing-rental',
    title: 'Hợp đồng thuê nhà trọ / Phòng trọ',
    subtitle: 'Tiền cọc, chi phí phát sinh và bàn giao.',
    category: 'housing',
    description: 'Hợp đồng thuê phòng trọ, căn hộ mini sinh viên bảo đảm quyền lợi tiền cọc, giá điện nước chuẩn nhà nước và điều kiện trả phòng.',
    tags: ['Tiền cọc', 'Điện nước niêm yết', 'Thời gian báo trước', 'Biên bản bàn giao'],
    riskCount: 3,
    officialUrl: 'https://thuvienphapluat.vn/bieumau/19717/MAU-HOP-DONG-THUE-NHA-O-AP-DUNG-CHO-HO-GIA-DINH-CA-NHAN',
    officialSource: 'Thư viện Pháp luật (Hợp đồng thuê nhà ở)',
    clauses: [
      {
        title: 'Điều 1: Tiền đặt cọc và hoàn trả',
        content: 'Bên thuê đặt cọc 2 tháng tiền phòng. Trong mọi trường hợp bên thuê chấm dứt hợp đồng trước hạn, bên cho thuê có quyền tịch thu 100% tiền đặt cọc mà không cần lý do.',
        isRisky: true,
        riskReason: 'Tịch thu tiền cọc bất kể trường hợp nào (kể cả lỗi bên cho thuê) là điều khoản đơn phương bất lợi.',
        advice: 'Nêu rõ: Nếu bên thuê báo trước 30 ngày hoặc do nhà trọ hư hỏng không khắc phục thì bên cho thuê phải hoàn trả lại 100% tiền cọc.',
        lawReference: 'Điều 328 & Điều 472 Bộ luật Dân sự 2015'
      },
      {
        title: 'Điều 2: Đơn giá điện nước và dịch vụ',
        content: 'Tiền điện tính 4.500 VNĐ/kWh, tiền nước 100.000 VNĐ/người/tháng. Phí bảo trì và thang máy có thể tăng bất kỳ lúc nào theo thông báo miệng.',
        isRisky: true,
        riskReason: 'Thu tiền điện vượt khung quy định nhà nước và chi phí dịch vụ tăng tùy tiện không văn bản.',
        advice: 'Giá điện nhà trọ cho sinh viên được áp dụng theo Thông tư 25/2018/TT-BCT. Phí dịch vụ phải niêm yết cố định trong suốt thời hạn hợp đồng.',
        lawReference: 'Thông tư 25/2018/TT-BCT & Luật Giá'
      },
      {
        title: 'Điều 3: Quyền ra vào và kiểm tra phòng',
        content: 'Chủ nhà có quyền vào kiểm tra phòng bất cứ lúc nào không cần báo trước để bảo đảm an ninh trật tự.',
        isRisky: true,
        riskReason: 'Xâm phạm quyền riêng tư và chỗ ở hợp pháp của người thuê.',
        advice: 'Bổ sung: Chủ nhà chỉ được vào phòng khi có sự đồng ý của bên thuê hoặc có thông báo trước tối thiểu 24 giờ (trừ trường hợp khẩn cấp như hỏa hoạn).',
        lawReference: 'Điều 22 Hiến pháp 2013 & Điều 132 Luật Nhà ở 2023'
      },
      {
        title: 'Điều 4: Biên bản bàn giao trang thiết bị',
        content: 'Hai bên lập biên bản kiểm kê tình trạng điều hòa, nóng lạnh, giường tủ trước khi nhận phòng. Hao mòn tự nhiên không tính vào chi phí đền bù.',
        isRisky: false,
        advice: 'Giúp tránh tranh chấp trừ tiền cọc vô lý khi trả phòng.'
      }
    ]
  },
  {
    id: 'apartment-rental',
    title: 'Hợp đồng thuê căn hộ / chung cư',
    subtitle: 'Quy chế ban quản lý, bảo trì và phí dịch vụ.',
    category: 'housing',
    description: 'Hợp đồng thuê căn hộ chung cư áp dụng theo mẫu Nghị định 96/2024/NĐ-CP, phân định rõ phí quản lý và nghĩa vụ nội quy tòa nhà.',
    tags: ['Chung cư', 'Nghị định 96/2024', 'Phí quản lý', 'Hao mòn tự nhiên'],
    riskCount: 2,
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Bat-dong-san/Nghi-dinh-96-2024-ND-CP-huong-dan-Luat-Kinh-doanh-bat-dong-san-592652.aspx',
    officialSource: 'Thư viện Pháp luật (Nghị định 96/2024/NĐ-CP)',
    clauses: [
      {
        title: 'Điều 1: Phí dịch vụ chung cư và gửi xe',
        content: 'Bên thuê có trách nhiệm thanh toán phí dịch vụ tòa nhà và phí gửi xe trực tiếp cho Ban quản lý theo biểu giá niêm yết của ban quản trị chung cư.',
        isRisky: false,
        advice: 'Cần kiểm tra xem phí này do chủ nhà trả hay người thuê trả trong hợp đồng.'
      },
      {
        title: 'Điều 2: Tự ý thay đổi kết cấu căn hộ',
        content: 'Bên thuê không được phép khoan tường, sơn sửa hoặc thay đổi kiến trúc nội thất khi chưa có sự chấp thuận bằng văn bản của chủ nhà.',
        isRisky: false,
        advice: 'Bảo vệ tài sản đôi bên, hợp lý trong hợp đồng thuê nhà.'
      },
      {
        title: 'Điều 3: Tăng giá thuê nhà theo biến động thị trường',
        content: 'Bên cho thuê có quyền điều chỉnh tăng giá thuê lên đến 20% sau mỗi 6 tháng tùy theo giá thị trường chung cư trong khu vực.',
        isRisky: true,
        riskReason: 'Biên độ tăng giá quá cao và thời hạn 6 tháng quá ngắn gây bất ổn chỗ ở cho sinh viên.',
        advice: 'Thỏa thuận giá thuê cố định tối thiểu 1 năm hoặc biên độ tăng không vượt quá 5-10%/năm.',
        lawReference: 'Điều 482 Bộ luật Dân sự 2015'
      }
    ]
  },
  {
    id: 'course-training',
    title: 'Hợp đồng đào tạo & Khóa học kỹ năng',
    subtitle: 'Chất lượng giảng dạy, cam kết việc làm và hoàn phí.',
    category: 'course',
    description: 'Hợp đồng cung cấp dịch vụ đào tạo lập trình, ngoại ngữ, chứng chỉ quốc tế với các điều khoản hoàn học phí và bảo đảm đầu ra.',
    tags: ['Cam kết đầu ra', 'Chính sách hoàn phí', 'Chất lượng giảng dạy', 'Bảo lưu'],
    riskCount: 2,
    officialUrl: 'https://thuvienphapluat.vn/bieumau/23023/MAU-PHUONG-AN-DAO-TAO-BOI-DUONG-NANG-CAO-TRINH-DO-KY-NANG-NGHE-VA-DUY-TRI-VIEC-LAM-CHO-NGUOI-LAO-DONG',
    officialSource: 'Thư viện Pháp luật (Mẫu HĐ Đào tạo nghề)',
    clauses: [
      {
        title: 'Điều 1: Nội dung đào tạo và lộ trình',
        content: 'Trung tâm cam kết cung cấp đầy đủ giáo trình, giảng viên đạt chuẩn và phòng thực hành máy tính theo đúng đề cương đã công bố.',
        isRisky: false,
        advice: 'Yêu cầu đính kèm đề cương chi tiết vào phụ lục hợp đồng.'
      },
      {
        title: 'Điều 2: Chính sách không hoàn phí trong mọi trường hợp',
        content: 'Học viên đã nộp học phí sẽ không được hoàn lại dưới bất kỳ lý do gì, kể cả khi trung tâm đơn phương đổi giảng viên hoặc dời lịch học.',
        isRisky: true,
        riskReason: 'Vi phạm quyền được hoàn phí khi bên cung cấp dịch vụ không đáp ứng cam kết chất lượng.',
        advice: 'Yêu cầu điều khoản: Nếu trung tâm hủy lớp hoặc đổi lịch quá 3 lần thì học viên được hoàn 100% học phí.',
        lawReference: 'Luật Bảo vệ quyền lợi người tiêu dùng 2023 & Điều 513 BLDS 2015'
      },
      {
        title: 'Điều 3: Cam kết giới thiệu việc làm đầu ra',
        content: 'Trung tâm cam kết 100% học viên tốt nghiệp có việc làm mức lương từ 10 triệu/tháng, với điều kiện học viên đạt 100% điểm chuyên cần và vượt qua bài thi nội bộ.',
        isRisky: true,
        riskReason: 'Tiêu chí "bài thi nội bộ" thường rất khó hoặc mơ hồ để từ chối trách nhiệm cam kết.',
        advice: 'Làm rõ tiêu chí bài test và quy trình giới thiệu phỏng vấn việc làm cụ thể.',
        lawReference: 'Luật Giáo dục nghề nghiệp & Luật Quảng cáo'
      }
    ]
  },
  {
    id: 'installment-purchase',
    title: 'Hợp đồng mua trả góp thiết bị (Laptop, Xe)',
    subtitle: 'Lãi suất, phí phạt chậm nợ và bảo hiểm khoản vay.',
    category: 'installment',
    description: 'Hợp đồng mua hàng trả góp thiết bị học tập, laptop, xe máy qua công ty tài chính cho học sinh sinh viên.',
    tags: ['Mua trả góp', 'Phí phạt trễ hạn', 'Bảo hiểm khoản vay', 'Bảng tính lãi'],
    riskCount: 3,
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Thuong-mai/Luat-Bao-ve-quyen-loi-nguoi-tieu-dung-2023-so-19-2023-QH15-542617.aspx',
    officialSource: 'Thư viện Pháp luật (Luật Bảo vệ quyền lợi người tiêu dùng)',
    clauses: [
      {
        title: 'Điều 1: Lãi suất danh nghĩa vs Lãi suất thực tế',
        content: 'Lãi suất quảng cáo 0% nhưng phát sinh phí quản lý hồ sơ 350.000 VNĐ/tháng và phí duy trì hạn mức định kỳ.',
        isRisky: true,
        riskReason: 'Quảng cáo 0% nhưng thực chất lãi suất ẩn qua các loại phí định kỳ rất cao.',
        advice: 'Yêu cầu nhân viên tài chính cung cấp Bảng tính lãi suất thực tế tổng chi phí (Total Cost of Credit).',
        lawReference: 'Thông tư 18/2019/TT-NHNN & Điều 468 BLDS 2015'
      },
      {
        title: 'Điều 2: Mức phạt trễ hạn quá mức',
        content: 'Chậm thanh toán 1 ngày bị phạt cố định 500.000 VNĐ cộng thêm 150% lãi suất quá hạn trên toàn bộ dư nợ còn lại.',
        isRisky: true,
        riskReason: 'Phí phạt quá cao so với giá trị kỳ góp hàng tháng của sinh viên.',
        advice: 'Kiểm tra mức phạt tối đa theo quy định của Ngân hàng Nhà nước.',
        lawReference: 'Thông tư 39/2016/TT-NHNN'
      },
      {
        title: 'Điều 3: Bảo hiểm khoản vay tự nguyện',
        content: 'Khách hàng có quyền lựa chọn tham gia hoặc không tham gia bảo hiểm khoản vay. Phí bảo hiểm không phải điều kiện bắt buộc để giải ngân.',
        isRisky: false,
        advice: 'Không được ép buộc sinh viên mua bảo hiểm để duyệt hồ sơ vay trả góp.'
      }
    ]
  },
  {
    id: 'consumer-loan',
    title: 'Hợp đồng vay tiêu dùng cá nhân',
    subtitle: 'Hạn mức vay, phương thức thu nợ và lãi suất.',
    category: 'loan',
    description: 'Hợp đồng vay vốn tiêu dùng cá nhân, app vay tiền online; cảnh báo bẫy lãi suất cao và điều khoản thu hồi nợ quấy rối.',
    tags: ['Vay tiêu dùng', 'Lãi suất trần', 'Thu hồi nợ', 'Thông tư 18/2019'],
    riskCount: 3,
    officialUrl: 'https://thuvienphapluat.vn/van-ban/Tien-te-Ngan-hang/Thong-tu-18-2019-TT-NHNN-sua-doi-Thong-tu-43-2016-TT-NHNN-cho-vay-tieu-dung-cua-cong-ty-tai-chinh-427772.aspx',
    officialSource: 'Thư viện Pháp luật (Thông tư 18/2019/TT-NHNN)',
    clauses: [
      {
        title: 'Điều 1: Trần lãi suất thỏa thuận',
        content: 'Lãi suất vay tính theo 3.5%/tháng (tương đương 42%/năm), chưa bao gồm các loại phí tư vấn và thẩm định hồ sơ.',
        isRisky: true,
        riskReason: 'Vượt quá trần lãi suất 20%/năm theo Điều 468 BLDS 2015.',
        advice: 'Cảnh giác với các hình thức tín dụng đen hoặc app vay nặng lãi núp bóng công ty tài chính.',
        lawReference: 'Điều 468 Bộ luật Dân sự 2015'
      },
      {
        title: 'Điều 2: Phương thức đôn đốc và thu hồi nợ',
        content: 'Bên cho vay có quyền liên hệ gia đình, nhà trường, bạn bè và đăng tải thông tin lên mạng xã hội nếu bên vay chậm thanh toán quá 3 ngày.',
        isRisky: true,
        riskReason: 'Hành vi đe dọa, khủng bố tinh thần và gọi điện cho người thân vi phạm nghiêm trọng Thông tư 18/2019/TT-NHNN.',
        advice: 'Thông tư 18/2019/TT-NHNN cấm các công ty tài chính gọi điện nhắc nợ cho người thân không có nghĩa vụ trả nợ.',
        lawReference: 'Thông tư 18/2019/TT-NHNN & Nghị định 144/2021/NĐ-CP'
      },
      {
        title: 'Điều 3: Quyền tất toán trước hạn',
        content: 'Bên vay có quyền tất toán khoản nợ trước hạn bất cứ lúc nào với mức phí trả nợ trước hạn tối đa 1-2% trên số dư nợ còn lại.',
        isRisky: false,
        advice: 'Hợp lý theo thông lệ tài chính ngân hàng.'
      }
    ]
  }
];
