const MICROBIOLOGY_INTRO =
  "<p><strong>Microbiology: An Introduction</strong> giới thiệu những khái niệm nền tảng về thế giới vi sinh vật, cách phân loại và cấu trúc của chúng, quá trình sinh trưởng, trao đổi chất và di truyền. Sách tiếp tục trình bày mối liên hệ giữa vi sinh vật với bệnh truyền nhiễm, dịch tễ học, miễn dịch và thuốc kháng vi sinh vật. Cách tiếp cận nhập môn giúp người đọc hiểu vai trò của vi sinh vật trong sức khỏe con người và các ứng dụng thực tiễn.</p>";

module.exports.getBookDescription = (book) => {
  const authorText = String(book?.author || "").toLowerCase();
  const sourceDescription = String(book?.description || "");
  const isTortoraMicrobiology =
    authorText.includes("gerard j. tortora") &&
    authorText.includes("berdell r. funke") &&
    authorText.includes("christine l. case");
  const isBibliographicPlaceholder = /open library/i.test(sourceDescription);

  if (isTortoraMicrobiology && isBibliographicPlaceholder) {
    return MICROBIOLOGY_INTRO;
  }

  return sourceDescription;
};

export {};
