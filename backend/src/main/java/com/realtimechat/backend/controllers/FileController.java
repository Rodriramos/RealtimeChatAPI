package com.realtimechat.backend.controllers;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.realtimechat.backend.dtos.UploadResultDTO;
import com.realtimechat.backend.services.UploadService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final UploadService uploadService;
    private final RestTemplate restTemplate;

    @PostMapping("/upload")
    public ResponseEntity<UploadResultDTO> upload(
            @RequestParam("file") MultipartFile file) throws Exception {

        if (file.isEmpty())
            return ResponseEntity.badRequest().build();
        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE).build();
        }

        return ResponseEntity.ok(uploadService.uploadFile(file));
    }

    @GetMapping("/download")
    public ResponseEntity<byte[]> download(
            @RequestParam String url,
            @RequestParam String fileName) throws Exception {

        byte[] bytes = restTemplate.getForObject(url, byte[].class);
        if (bytes == null)
            return ResponseEntity.notFound().build();

        String encodedName = URLEncoder.encode(fileName, StandardCharsets.UTF_8)
                .replace("+", "%20");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename*=UTF-8''" + encodedName)
                .header(HttpHeaders.CONTENT_TYPE, "application/octet-stream")
                .body(bytes);
    }
}
