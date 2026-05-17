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
        String resourceType;

        if (contentType.startsWith("video")) {
            resourceType = "video";
        } else if (contentType.equals("application/pdf") || contentType.startsWith("application")) {
            resourceType = "raw"; // ← Cloudinary usa "raw" para PDFs y otros archivos
        } else {
            resourceType = "image";
        }

        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "resource_type", resourceType,
                        "folder", "realtimechat"));

        String url = (String) result.get("url");
        String publicId = (String) result.get("public_id");

        return new UploadResultDTO(url, publicId, resourceType);
    }
}
