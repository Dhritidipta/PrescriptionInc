package com.prescription.app.server;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;


@RestController
@CrossOrigin(origins = "*")
public class AdminController {

    private final BlobService blobService;
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    private final Map<Integer, Version> store = Collections.synchronizedMap(new HashMap<>());
    private final Path storageDir;
    
    public AdminController(BlobService blobService) throws IOException {
        this.blobService = blobService;
        storageDir = java.nio.file.Paths.get(System.getProperty("user.dir"), "uploaded_versions");
        if (!Files.exists(storageDir)) Files.createDirectories(storageDir);
    }

    // Multipart upload (client-generated PDF file)
    @PostMapping(path = "/api/admin/uploadVersion", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Version> uploadVersionMultipart(
            @RequestPart(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "version", required = false) String version,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "printedCopies", required = false) Integer printedCopies,
            @RequestHeader Map<String, String> headers,
            @RequestHeader(value = "X-Forwarded-For", required = false) String xff
    ) throws IOException {
        try {
            logger.info("Upload headers: Origin='{}' Content-Type='{}' User-Agent='{}' X-Forwarded-For='{}'",
                    headers.get("Origin"), headers.get("Content-Type"), headers.get("User-Agent"), xff);
            if (file != null) {
                logger.info("Uploaded file: name='{}' original='{}' size={} bytes", file.getName(), file.getOriginalFilename(), file.getSize());
            }
        } catch (Exception e) {
            logger.warn("Failed to log upload request details", e);
        }

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        
        // Upload to Vercel Blob
        String blobUrl;
        try {
            byte[] fileBytes = file.getBytes();
            String contentType = file.getContentType();
            if (contentType == null) contentType = "application/pdf";
            String filename = file.getName() + "-" + version + ".pdf";
            blobUrl = blobService.uploadFile(fileBytes, filename, contentType);
            logger.info("Successfully uploaded to Vercel Blob: {}", blobUrl);
        } catch (Exception e) {
            logger.error("Failed to upload to Vercel Blob", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }

        String modifiedDate = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
                .withZone(ZoneId.systemDefault())
                .format(Instant.now());

        // Store blob URL instead of local filename
        Version v = new Version(version != null ? version : "v1.0", modifiedDate, 
                notes != null ? notes : "", printedCopies != null ? printedCopies : 1, blobUrl);
        store.put(v.getId(), v);

        return ResponseEntity.ok(v);
    }

    // // JSON endpoint: accept HTML and optional CSS and render server-side
    // @PostMapping(path = "/api/admin/uploadVersion", consumes = MediaType.APPLICATION_JSON_VALUE)
    // public ResponseEntity<Version> uploadVersionJson(@RequestBody Map<String, Object> payload) throws IOException {
    //     if (payload == null) return ResponseEntity.badRequest().build();

    //     String html = payload.getOrDefault("html", "").toString();
    //     String css = payload.getOrDefault("css", "").toString();
    //     String version = payload.getOrDefault("version", "").toString();
    //     String notes = payload.getOrDefault("notes", "").toString();
    //     Integer printedCopies = null;
    //     try {
    //         Object pc = payload.get("printedCopies");
    //         if (pc != null) printedCopies = Integer.parseInt(pc.toString());
    //     } catch (Exception ex) {
    //         printedCopies = null;
    //     }

    //     int id = nextId();
    //     String filename = "version-" + id + ".pdf";
    //     Path target = storageDir.resolve(filename);

    //     byte[] pdfBytes = pdfService.renderHtmlToPdf(html, css);
    //     try{

    //         Files.write(target, pdfBytes);
    //     }
    //     catch(Exception e)
    //     {
    //         logger.warn("Failed rendering to PDF: ", e);
    //     }

    //     String modifiedDate = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
    //             .withZone(ZoneId.systemDefault())
    //             .format(Instant.now());

    //     Version v = new Version(id, version, modifiedDate, notes == null ? "" : notes, printedCopies, filename);
    //     store.put(id, v);

    //     return ResponseEntity.ok(v);
    // }

    @GetMapping("/api/versions")
    public List<Version> listVersions() {
        synchronized (store) {
            return new ArrayList<>(store.values());
        }
    }

    @GetMapping("/api/version/{id}/pdf")
    public ResponseEntity<Resource> getPdf(@PathVariable("id") int id) throws IOException {
        Version v = store.get(id);
        if (v == null) return ResponseEntity.notFound().build();
        
        String blobUrl = v.getFilename(); // Now stores blob URL
        
        // If it's a blob URL (starts with http), redirect to it
        if (blobUrl != null && blobUrl.startsWith("http")) {
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header(HttpHeaders.LOCATION, blobUrl)
                    .build();
        }
        
        // Fallback to local file if blob URL is not available
        Path file = storageDir.resolve(blobUrl);
        if (!Files.exists(file)) return ResponseEntity.notFound().build();

        Resource resource = new UrlResource(file.toUri());
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + v.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}