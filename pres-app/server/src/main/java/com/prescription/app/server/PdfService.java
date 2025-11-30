package com.prescription.app.server;

import java.io.ByteArrayOutputStream;
import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Document.OutputSettings;
import org.jsoup.nodes.Entities.EscapeMode;

@Service
public class PdfService {

    private static final Logger logger = LoggerFactory.getLogger(PdfService.class);

    /**
     * Render given HTML (body fragment) and optional CSS into a PDF byte array.
     * The provided html fragment will be wrapped into a minimal HTML document with supplied CSS.
     */
    public byte[] renderHtmlToPdf(String htmlFragment, String css) throws IOException {
        // Use JSoup to convert arbitrary HTML into well-formed XHTML
        String inputHtml = htmlFragment == null ? "" : htmlFragment;
        Document doc = Jsoup.parse(inputHtml);
        // Ensure head/meta
        Element head = doc.head();
        head.select("meta[charset]").remove();
        head.prependElement("meta").attr("charset", "utf-8");
        // Inject CSS into head if provided
        if (css != null && !css.isEmpty()) {
            head.appendElement("style").attr("type", "text/css").appendText(css);
        }
        OutputSettings out = new OutputSettings();
        out.syntax(OutputSettings.Syntax.xml);
        out.escapeMode(EscapeMode.xhtml);
        out.charset(java.nio.charset.StandardCharsets.UTF_8);
        out.prettyPrint(false);
        doc.outputSettings(out);
        String finalHtml = doc.outerHtml();

        ByteArrayOutputStream os = new ByteArrayOutputStream();
        try {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(finalHtml, null);
            builder.toStream(os);
            builder.run();
            return os.toByteArray();
        } catch (Exception e) {
            logger.error("Failed to render PDF", e);
            throw new IOException("PDF rendering failed", e);
        } finally {
            try { os.close(); } catch (Exception ex) {}
        }
    }
}
