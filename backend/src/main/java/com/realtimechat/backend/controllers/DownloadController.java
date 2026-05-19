package com.realtimechat.backend.controllers;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/download")
@RequiredArgsConstructor
public class DownloadController {

    private final RestTemplate restTemplate;

    @GetMapping
    public ResponseEntity<byte[]> download(
            @RequestParam String url,
            @RequestParam String fileName) throws Exception {

        // Descargar el archivo de Cloudinary
        byte[] bytes = restTemplate.getForObject(url, byte[].class);
        if (bytes == null) return ResponseEntity.notFound().build();

        // Codificar el nombre para el header
        String encodedName = URLEncoder.encode(fileName, StandardCharsets.UTF_8)
                .replace("+", "%20");

        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename*=UTF-8''" + encodedName)
            .header(HttpHeaders.CONTENT_TYPE, "application/octet-stream")
            .body(bytes);
    }
}
