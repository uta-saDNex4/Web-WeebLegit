import { LegalSource } from '../types';

export const LEGAL_SOURCES: LegalSource[] = [
  {
    id: 'civil-code',
    title: 'Bộ luật Dân sự 2015',
    codeBadge: 'BLDS 2015',
    description: 'Quy định nền tảng về hợp đồng dân sự, đặt cọc (Điều 328), phạt vi phạm và bồi thường thiệt hại (Điều 418).',
    articles: [
      'Điều 328 BLDS 2015: Đặt cọc và xử lý tài sản đặt cọc khi giao kết hoặc thực hiện hợp đồng dân sự.',
      'Điều 418 BLDS 2015: Thỏa thuận phạt vi phạm và bồi thường thiệt hại trong hợp đồng.',
      'Điều 472 - 482 BLDS 2015: Hợp đồng thuê tài sản, quyền và nghĩa vụ các bên.',
      'Điều 513 BLDS 2015: Hợp đồng dịch vụ và giới hạn quyền yêu cầu sửa đổi.'
    ],
    linkText: 'Xem điều khoản chi tiết',
    url: 'https://thuvienphapluat.vn/van-ban/Quyen-dan-su/Bo-luat-dan-su-2015-282332.aspx',
    iconType: 'civil',
    actionType: 'modal'
  },
  {
    id: 'labor-code',
    title: 'Bộ luật Lao động 2019',
    codeBadge: 'BLLĐ 2019',
    description: 'Bảo vệ quyền lợi người làm việc, hợp đồng đào tạo (Điều 62), thử việc và các hành vi người sử dụng lao động không được làm (Điều 17).',
    articles: [
      'Điều 17 BLLĐ 2019: Các hành vi người sử dụng lao động không được làm khi giao kết hợp đồng (Nghiêm cấm giữ bản chính giấy tờ tùy thân, giữ tiền hoặc tài sản).',
      'Điều 26 BLLĐ 2019: Tiền lương thử việc (Ít nhất bằng 85% mức lương chính thức của công việc đó).',
      'Điều 62 BLLĐ 2019: Hợp đồng đào tạo nghề và chi phí bồi hoàn đào tạo (Chỉ bồi hoàn chi phí hợp lệ kèm chứng từ thực tế).',
      'Điều 98 & 107 BLLĐ 2019: Tiền lương làm thêm giờ, thời giờ làm thêm và sự đồng ý của người lao động.'
    ],
    linkText: 'Xem điều khoản chi tiết',
    url: 'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-Luat-lao-dong-2019-333670.aspx',
    iconType: 'labor',
    actionType: 'modal'
  },
  {
    id: 'housing-code',
    title: 'Luật Nhà ở 2023 & Quy định Thuê trọ',
    codeBadge: 'LNƠ 2023',
    description: 'Quyền và nghĩa vụ các bên thuê nhà ở, giới hạn tăng giá điện nước, bảo vệ quyền cư trú hợp pháp.',
    articles: [
      'Điều 132 Luật Nhà ở 2023: Đơn phương chấm dứt thực hiện hợp đồng thuê nhà ở và thời hạn báo trước tối thiểu 30 ngày.',
      'Thông tư 25/2018/TT-BCT & 09/2019/TT-BCT: Khung giá bán lẻ điện sinh hoạt cho sinh viên thuê nhà trọ theo giá bậc thang nhà nước.',
      'Nghị định 144/2021/NĐ-CP: Xử phạt hành vi xâm phạm chỗ ở hợp pháp và tự ý kiểm tra phòng trọ.',
      'Quy chế quản lý cư trú: Đăng ký tạm trú và quyền lợi cư trú hợp pháp của người thuê nhà.'
    ],
    linkText: 'Xem điều khoản chi tiết',
    url: 'https://thuvienphapluat.vn/van-ban/Bat-dong-san/Luat-Nha-o-2023-27-2023-QH15-538466.aspx',
    iconType: 'housing',
    actionType: 'modal'
  }
];

export const SAMPLE_AI_QUESTIONS = [
  {
    question: 'Điều khoản “chi phí đào tạo” này có nghĩa là gì?',
    answer: 'Đây thường là khoản hoàn trả nếu bạn nghỉ sớm. Hãy hỏi rõ: chi phí nào được tính thực tế (có hóa đơn/chứng chỉ không), thời hạn cam kết bao lâu và công thức tính khấu trừ theo thời gian làm việc.',
    citation: 'Điều 62 Bộ luật Lao động 2019'
  },
  {
    question: 'Chủ nhà đòi giữ 100% tiền cọc nếu em chuyển đi trước 6 tháng thì có đúng không?',
    answer: 'Nếu trong hợp đồng không có thỏa thuận phạt vi phạm rõ ràng hoặc bạn đã báo trước 30 ngày theo quy định, việc tịch thu toàn bộ cọc là bất lợi cho bạn. Hãy đề xuất điều khoản: "Báo trước 30 ngày thì được hoàn lại 100% cọc sau khi thanh toán hết tiền điện nước".',
    citation: 'Điều 328 Bộ luật Dân sự 2015'
  },
  {
    question: 'Công ty giữ lại 500k tiền hồ sơ và cọc đồng phục có được phép không?',
    answer: 'Hoàn toàn KHÔNG ĐƯỢC PHÉP. Điều 17 Bộ luật Lao động 2019 nghiêm cấm người sử dụng lao động thu tiền, giữ tiền đặt cọc hoặc giữ giấy tờ tùy thân gốc của người lao động dưới bất kỳ hình thức nào.',
    citation: 'Điều 17 Bộ luật Lao động 2019'
  },
  {
    question: 'Thực tập sinh có bắt buộc phải làm việc ngoài giờ và có được tính tiền OT không?',
    answer: 'Nếu bạn làm việc thực tế tạo ra giá trị sản phẩm/dịch vụ ngoài giờ học tập thông thường, doanh nghiệp phải thỏa thuận phụ cấp làm thêm giờ rõ ràng và được sự đồng ý tự nguyện của bạn.',
    citation: 'Điều 98 & Điều 107 Bộ luật Lao động 2019'
  }
];
