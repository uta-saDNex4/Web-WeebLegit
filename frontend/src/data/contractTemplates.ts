import { ContractTemplate } from '../types';

export const CONTRACT_TEMPLATES: ContractTemplate[] = [
  {
    id: 'parttime-work',
    title: 'Việc làm part-time / full-time',
    subtitle: 'Lương, ca làm, thử việc và quyền lợi.',
    category: 'work',
    description: 'Hợp đồng lao động dành cho sinh viên làm thêm quán cafe, trợ giảng, bán hàng hoặc nhân viên thử việc.',
    tags: ['Lương theo giờ', 'Ca làm linh hoạt', 'Thử việc', 'Phụ cấp'],
    riskCount: 3,
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
    title: 'Thỏa thuận thực tập',
    subtitle: 'Mentor, phụ cấp và mục tiêu công việc.',
    category: 'internship',
    description: 'Thỏa thuận tiếp nhận thực tập sinh doanh nghiệp, phân định rõ giữa học tập thực tế và làm việc như nhân viên chính thức.',
    tags: ['Mentor hướng dẫn', 'Phụ cấp thực tập', 'Dấu mộc báo cáo', 'Bảo mật NDA'],
    riskCount: 2,
    clauses: [
      {
        title: 'Điều 1: Mục tiêu thực tập & Người hướng dẫn',
        content: 'Công ty phân công Mentor có chuyên môn hướng dẫn thực tập sinh hoàn thành đề tài tốt nghiệp và làm quen môi trường thực tế.',
        isRisky: false,
        advice: 'Nên ghi rõ tên hoặc chức danh Mentor cùng lịch đánh giá tiến độ định kỳ.'
      },
      {
        title: 'Điều 2: Phụ cấp và hỗ trợ chi phí',
        content: 'Thực tập sinh làm việc 40 giờ/tuần như nhân viên. Phụ cấp thực tập sẽ được xem xét tùy theo kết quả kinh doanh của công ty vào cuối kỳ.',
        isRisky: true,
        riskReason: 'Không cam kết mức phụ cấp cụ thể trong khi yêu cầu khối lượng làm việc toàn thời gian.',
        advice: 'Cần làm rõ phụ cấp cứng hàng tháng (tiền ăn trưa, xăng xe, trợ cấp học tập) và tiêu chí đánh giá cụ thể.',
        lawReference: 'Bộ luật Dân sự 2015 & Hướng dẫn thực tập sinh'
      },
      {
        title: 'Điều 3: Cam kết đào tạo và phạt bồi thường',
        content: 'Nếu thực tập sinh không tiếp tục làm việc chính thức tại công ty sau khi tốt nghiệp thì phải bồi thường chi phí đào tạo 15.000.000 VNĐ.',
        isRisky: true,
        riskReason: 'Điều khoản gài bẫy chi phí đào tạo không có chứng từ đào tạo chuyên môn thực tế.',
        advice: 'Theo Điều 62 BLLĐ, chi phí đào tạo chỉ được yêu cầu bồi thường khi công ty chi trả học phí thực tế tại cơ sở đào tạo kèm hóa đơn, chứng chỉ rõ ràng.',
        lawReference: 'Điều 62 Bộ luật Lao động 2019'
      },
      {
        title: 'Điều 4: Xác nhận dấu mộc báo cáo',
        content: 'Công ty cam kết hỗ trợ xác nhận dấu mộc và cung cấp nhận xét trung thực vào Báo cáo thực tập tốt nghiệp của trường.',
        isRisky: false,
        advice: 'Điều khoản chuẩn giúp bảo đảm sinh viên đủ điều kiện tốt nghiệp.'
      }
    ]
  },
  {
    id: 'freelance-contract',
    title: 'Cộng tác viên / freelance',
    subtitle: 'Phạm vi việc làm, deadline và thanh toán.',
    category: 'freelance',
    description: 'Hợp đồng dịch vụ cộng tác viên thiết kế, lập trình, viết content, dịch thuật với các mốc thanh toán rõ ràng.',
    tags: ['Mốc nghiệm thu', 'Tạm ứng cọc 30-50%', 'Quyền tác giả', 'Phí trễ hạn'],
    riskCount: 2,
    clauses: [
      {
        title: 'Điều 1: Phạm vi công việc và số lần chỉnh sửa',
        content: 'Bên B thực hiện thiết kế bộ nhận diện thương hiệu theo brief. Bên A có quyền yêu cầu chỉnh sửa không giới hạn số lần cho đến khi hoàn toàn hài lòng.',
        isRisky: true,
        riskReason: 'Yêu cầu sửa đổi không giới hạn (infinite revisions) dẫn đến nguy cơ bị bóc lột công sức và trễ tiến độ.',
        advice: 'Quy định tối đa 2 - 3 vòng chỉnh sửa miễn phí theo brief ban đầu; các chỉnh sửa ngoài phạm vi tính phí bổ sung.',
        lawReference: 'Điều 513 Bộ luật Dân sự 2015'
      },
      {
        title: 'Điều 2: Tiến độ thanh toán',
        content: 'Bên B bàn giao toàn bộ file gốc và quyền sở hữu trước. Bên A sẽ tiến hành thanh toán 100% thù lao trong vòng 45 ngày làm việc sau khi nghiệm thu.',
        isRisky: true,
        riskReason: 'Không có tiền tạm ứng và thời gian thanh toán quá dài (45 ngày) sau khi đã giao file gốc.',
        advice: 'Áp dụng quy tắc chia đợt: Tạm ứng 30-50% khi ký hợp đồng, 30% khi duyệt bản nháp, và 20-40% còn lại trước khi giao file gốc hoàn chỉnh.',
        lawReference: 'Điều 519 Bộ luật Dân sự 2015'
      },
      {
        title: 'Điều 3: Bản quyền và quyền tác giả',
        content: 'Quyền tác giả nhân thân luôn thuộc về bên sáng tạo. Quyền tài sản chỉ được chuyển giao sau khi bên A đã thanh toán đủ 100% thù lao.',
        isRisky: false,
        advice: 'Điều khoản bảo vệ quyền lợi sở hữu trí tuệ rất chuẩn mực.'
      }
    ]
  },
  {
    id: 'housing-rental',
    title: 'Hợp đồng thuê nhà trọ',
    subtitle: 'Tiền cọc, chi phí phát sinh và bàn giao.',
    category: 'housing',
    description: 'Hợp đồng thuê phòng trọ, căn hộ mini sinh viên bảo đảm quyền lợi tiền cọc, giá điện nước chuẩn nhà nước và điều kiện trả phòng.',
    tags: ['Tiền cọc', 'Điện nước niêm yết', 'Thời gian báo trước', 'Biên bản bàn giao'],
    riskCount: 3,
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
  }
];
