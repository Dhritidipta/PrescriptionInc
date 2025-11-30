package com.prescription.app.server;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class BlobService {

    private static final Logger logger = LoggerFactory.getLogger(BlobService.class);
    
    private final HttpClient httpClient;
    // Pattern to extract URL from JSON response: "url": "https://..."
    private static final Pattern URL_PATTERN = Pattern.compile("\"url\"\\s*:\\s*\"([^\"]+)\"");
    
    // Hardcoded configuration - replace with your actual values
    private static final String BLOB_TOKEN = "vercel_blob_rw_lWHFdMZM2AfMjWe5_SDVu7C4IVJeY53DCD0RWaMLAjKGFWN";
    // Blob store URL is used for accessing (GET) files after upload
    private static final String BLOB_STORE_URL = "https://lwhfdmzm2afmjwe5.public.blob.vercel-storage.com";
    // Vercel Blob API upload endpoint
    private static final String BLOB_API_ENDPOINT = "https://blob.vercel-storage.com";

    public BlobService() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(30))
                .build();
        logger.info("BlobService initialized with hardcoded configuration");
    }

    /**
     * Upload a file to Vercel Blob Storage
     * @param fileBytes The file content as bytes
     * @param filename The filename/path for the blob
     * @param contentType The content type (e.g., "application/pdf")
     * @return The public URL of the uploaded blob (using BLOB_STORE_URL)
     * @throws Exception if upload fails
     */
    public String uploadFile(byte[] fileBytes, String filename, String contentType) throws Exception {
        if (BLOB_TOKEN == null || BLOB_TOKEN.isBlank() || BLOB_TOKEN.equals("YOUR_BLOB_READ_WRITE_TOKEN_HERE")) {
            throw new IllegalStateException("BLOB_TOKEN not configured. Update the hardcoded value in BlobService.");
        }
        
        if (BLOB_STORE_URL == null || BLOB_STORE_URL.isBlank() || BLOB_STORE_URL.contains("YOUR-STORE-ID")) {
            throw new IllegalStateException("BLOB_STORE_URL not configured. Update the hardcoded value in BlobService.");
        }
        
        // Try using the blob API endpoint with the filename
        // Format: https://blob.vercel-storage.com/{filename}
        String uploadUrl = BLOB_API_ENDPOINT + "/" + filename + "?download=0";
        
        logger.info("Uploading file to Vercel Blob API: {} ({} bytes)", uploadUrl, fileBytes.length);
        
        // PUT request to upload the file
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(uploadUrl))
                .header("Authorization", "Bearer " + BLOB_TOKEN)
                .header("Content-Type", contentType != null ? contentType : "application/pdf")
                .PUT(HttpRequest.BodyPublishers.ofByteArray(fileBytes))
                .build();
        
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        if (response.statusCode() / 100 != 2) {
            String errorBody = response.body();
            logger.error("Vercel Blob upload failed: {} - {}", response.statusCode(), errorBody);
            throw new RuntimeException("Failed to upload to Vercel Blob: " + response.statusCode() + " - " + errorBody);
        }
        
        // Parse the JSON response to get the actual blob URL
        // Response format: {"url": "https://...", "pathname": "...", "contentType": "...", ...}
        String responseBody = response.body();
        try {
            // Extract URL from JSON using regex
            Matcher matcher = URL_PATTERN.matcher(responseBody);
            if (matcher.find()) {
                String blobUrl = matcher.group(1);
                logger.info("Successfully uploaded to Vercel Blob. Accessible at: {}", blobUrl);
                return blobUrl;
            } else {
                logger.warn("Response did not contain 'url' field. Response: {}", responseBody);
                // Fallback: construct URL manually (though it may have a random suffix)
                return BLOB_STORE_URL;
            }
        } catch (Exception e) {
            logger.error("Failed to parse Vercel Blob response: {}", responseBody, e);
            // Fallback: construct URL manually
            return BLOB_STORE_URL;
        }
    }

    /**
     * Get file from Vercel Blob (returns the public URL - files are directly accessible)
     * @param blobUrl The public URL of the blob
     * @return The blob URL (public blobs are directly accessible)
     */
    public String getFileUrl(String blobUrl) {
        // Public blobs are directly accessible via their URL
        return blobUrl;
    }
}
