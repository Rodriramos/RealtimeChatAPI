package com.realtimechat.backend.services;

import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.realtimechat.backend.dtos.UploadResultDTO;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UploadService {

    private final Cloudinary cloudinary;

    public UploadResultDTO uploadFile(MultipartFile file) throws Exception {
        String contentType = file.getContentType() != null ? file.getContentType() : "";
        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "archivo";

        String resourceType;
        String messageType;

        if (contentType.startsWith("video")) {
            resourceType = "video";
            messageType = "VIDEO";
        } else if (contentType.startsWith("audio") || fileName.endsWith(".webm") || fileName.endsWith(".mp3")
                || fileName.endsWith(".ogg")) {
            resourceType = "raw";
            messageType = "AUDIO";
        } else if (contentType.equals("application/pdf")) {
            resourceType = "raw";
            messageType = "FILE";
        } else {
            resourceType = "image";
            messageType = "IMAGE";
        }

        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", resourceType,
                        "folder", "realtimechat",
                        "type", "upload"));

        String downloadUrl = ((String) result.get("secure_url"))
                .replace("/upload/", "/upload/fl_attachment/");
        String publicId = (String) result.get("public_id");

        return new UploadResultDTO(downloadUrl, publicId, messageType);
    }
}
