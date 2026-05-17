package com.realtimechat.backend.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.realtimechat.backend.dtos.UploadResultDTO;
import com.realtimechat.backend.services.UploadService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final UploadService uploadService;

    @PostMapping
    public ResponseEntity<UploadResultDTO> upload(
            @RequestParam("file") MultipartFile file) throws Exception {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Limitar tamaño — 10MB
        if (file.getSize() > 10 * 1024 * 1024) {
            return ResponseEntity.status(HttpStatus.CONTENT_TOO_LARGE).build();
        }

        UploadResultDTO result = uploadService.uploadFile(file);

        return ResponseEntity.ok(new UploadResultDTO(
            result.url(),
            result.publicId(),
            result.resourceType()
        ));
    }
}
