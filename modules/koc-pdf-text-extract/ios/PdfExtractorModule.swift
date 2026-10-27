import ExpoModulesCore
import PDFKit

public class PdfExtractorModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PdfExtractor")

    Function("isAvailable") { () -> Bool in
      return true
    }

    AsyncFunction("extractText") { (filePath: String, promise: Promise) in
      DispatchQueue.global(qos: .userInitiated).async {
        let url: URL
        if filePath.hasPrefix("file://"), let fileUrl = URL(string: filePath) {
          url = fileUrl
        } else {
          url = URL(fileURLWithPath: filePath)
        }

        guard let document = PDFDocument(url: url) else {
          promise.reject("PDF_LOAD_ERROR", "PDF dosyası açılamadı")
          return
        }
        if document.isLocked {
          promise.reject("PDF_PASSWORD_REQUIRED", "Şifreli PDF henüz desteklenmiyor")
          return
        }

        var fullText = ""
        for pageIndex in 0..<document.pageCount {
          if let page = document.page(at: pageIndex), let pageText = page.string {
            fullText += pageText
            if pageIndex < document.pageCount - 1 {
              fullText += "\n"
            }
          }
        }
        promise.resolve(fullText)
      }
    }
  }
}
