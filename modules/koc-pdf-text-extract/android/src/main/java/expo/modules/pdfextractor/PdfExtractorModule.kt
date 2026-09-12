package expo.modules.pdfextractor

import android.content.Context
import android.net.Uri
import com.tom_roush.pdfbox.android.PDFBoxResourceLoader
import com.tom_roush.pdfbox.pdmodel.PDDocument
import com.tom_roush.pdfbox.text.PDFTextStripper
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.InputStream

class PdfExtractorModule : Module() {
  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "React context is null" }

  override fun definition() = ModuleDefinition {
    Name("PdfExtractor")

    OnCreate {
      PDFBoxResourceLoader.init(context)
    }

    Function("isAvailable") {
      true
    }

    AsyncFunction("extractText") { filePath: String, promise: Promise ->
      try {
        getInputStream(filePath).use { stream ->
          PDDocument.load(stream).use { document ->
            val text = PDFTextStripper().apply {
              sortByPosition = true
              addMoreFormatting = false
            }.getText(document)
            promise.resolve(text)
          }
        }
      } catch (error: Exception) {
        promise.reject("PDF_EXTRACTION_ERROR", "PDF metni çıkarılamadı: ${error.message}", error)
      }
    }
  }

  private fun getInputStream(filePath: String): InputStream {
    return when {
      filePath.startsWith("content://") -> {
        context.contentResolver.openInputStream(Uri.parse(filePath))
          ?: throw IllegalArgumentException("Dosya açılamadı: $filePath")
      }
      filePath.startsWith("file://") -> File(filePath.removePrefix("file://")).inputStream()
      else -> File(filePath).inputStream()
    }
  }
}
