import { LegalSource } from '../types';

export const LEGAL_SOURCES: LegalSource[] = [
  {
    id: 'labor-code',
    title: 'Bộ luật Lao động & hướng dẫn liên quan',
    description: 'Quy định pháp lý về hợp đồng lao động, thử việc tối thiểu 85% lương, cấm giữ bằng cấp/tiền cọc, và thời giờ làm việc làm thêm cho sinh viên.',
    articles: [
      'Điều 17: Các hành vi người sử dụng lao động không được làm khi giao kết hợp đồng (Nghiêm cấm giữ bản chính giấy tờ tùy thân, văn bằng, chứng chỉ; giữ tiền hoặc tài sản).',
      'Điều 26: Tiền lương thử việc (Ít nhất bằng 85% mức lương chính thức của công việc đó).',
      'Điều 62: Hợp đồng đào tạo nghề và chi phí bồi hoàn đào tạo (Chỉ bồi hoàn chi phí hợp lệ kèm chứng từ đào tạo thực tế).',
      'Điều 98: Tiền lương làm thêm giờ, làm việc vào ban đêm (Ít nhất 150% ngày thường, 200% ngày nghỉ tuần, 300% ngày lễ tết).'
    ],
    linkText: 'Tra cứu Bộ luật Lao động 2019 (45/2019/QH14)',
    url: 'https://thuvienphapluat.vn/van-ban/Lao-dong-Tien-luong/Bo-Luat-lao-dong-2019-so-45-2019-QH14-333670.aspx',
    iconType: 'labor'
  },
  {
    id: 'housing-code',
    title: 'Quy định về thuê nhà ở và dân sự',
    description: 'Bảo vệ quyền lợi người thuê trọ, quy định đặt cọc theo Bộ luật Dân sự, giới hạn đơn giá điện nước sinh hoạt cho học sinh - sinh viên thuê trọ.',
    articles: [
      'Điều 328 BLDS 2015: Đặt cọc và xử lý tài sản đặt cọc khi chấm dứt hợp đồng.',
      'Điều 472 - 482 BLDS 2015: Hợp đồng thuê tài sản, quyền và nghĩa vụ của bên thuê & cho thuê.',
      'Thông tư 25/2018/TT-BCT & 09/2019/TT-BCT: Định mức giá bán lẻ điện sinh hoạt cho sinh viên thuê nhà trọ theo giá bậc thang nhà nước.',
      'Điều 132 Luật Nhà ở 2023: Đơn phương chấm dứt thực hiện hợp đồng thuê nhà ở và thời hạn báo trước tối thiểu 30 ngày.'
    ],
    linkText: 'Tra cứu Luật Nhà ở & Bộ luật Dân sự 2015',
    url: 'https://thuvienphapluat.vn/van-ban/Bat-dong-san/Luat-Nha-o-2023-so-27-2023-QH15-546059.aspx',
    iconType: 'housing'
  },
  {
    id: 'consumer-finance',
    title: 'Quy định tài chính tiêu dùng & trả góp',
    description: 'Quy tắc rà soát lãi suất cho vay, phí phạt trả nợ trước hạn và hợp đồng mua bán trả góp điện thoại, laptop cho sinh viên.',
    articles: [
      'Điều 468 BLDS 2015: Giới hạn trần lãi suất thỏa thuận không vượt quá 20%/năm của khoản vay.',
      'Thông tư 18/2019/TT-NHNN: Quy định về cho vay tiêu dùng của công ty tài chính, bảo vệ quyền lợi người tiêu dùng.',
      'Luật Bảo vệ quyền lợi người tiêu dùng 2023: Minh bạch biểu phí và điều khoản hợp đồng theo mẫu.'
    ],
    linkText: 'Tra cứu Luật Bảo vệ Quyền lợi Người tiêu dùng 2023',
    url: 'https://thuvienphapluat.vn/van-ban/Thuong-mai/Luat-Bao-ve-quyen-loi-nguoi-tieu-dung-2023-so-19-2023-QH15-542617.aspx',
    iconType: 'finance'
  },
  {
    id: 'cloud-storage',
    title: 'Nhập tài liệu từ không gian lưu trữ của bạn',
    description: 'Đồng bộ hóa trực tiếp hợp đồng PDF, ảnh chụp, file scan từ Google Drive, OneDrive, Dropbox hoặc bộ nhớ máy tính để kiểm tra bảo mật.',
    articles: [
      'Hỗ trợ định dạng: PDF, DOCX, TXT, PNG, JPG, HEIC.',
      'Mã hóa dữ liệu cục bộ: Tài liệu của bạn được phân tích bảo mật và không chia sẻ cho bên thứ ba.',
      'Tự động nhận diện chữ in hoa, điều khoản mập mờ và câu chữ gài bẫy pháp lý.'
    ],
    linkText: 'Kết nối tài khoản Drive / Tải lên ngay',
    url: '#checker',
    iconType: 'storage'
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
