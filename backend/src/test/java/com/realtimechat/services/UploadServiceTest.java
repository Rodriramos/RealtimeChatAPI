package com.realtimechat.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.Uploader;
import com.realtimechat.backend.dtos.UploadResultDTO;
import com.realtimechat.backend.services.UploadService;

@ExtendWith(MockitoExtension.class)
class UploadServiceTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;  // com.cloudinary.Uploader, no com.cloudinary.uploader.Uploader

    @Mock
    private MultipartFile multipartFile;

    @InjectMocks
    private UploadService uploadService;

    private Map<String, Object> cloudinaryResponse;

    @BeforeEach
    void setUp() {
        cloudinaryResponse = new HashMap<>();
        cloudinaryResponse.put("secure_url", "https://res.cloudinary.com/example/upload/v1234/test.jpg");
        cloudinaryResponse.put("public_id", "realtimechat/test");

        // Un solo stub para cloudinary.uploader() reutilizado en todos los tests
        when(cloudinary.uploader()).thenReturn(uploader);
    }

    // -------------------------------------------------------------------------
    // IMAGE
    // -------------------------------------------------------------------------

    @Test
    void testUploadFile_ImageJpeg_Success() throws Exception {
        when(multipartFile.getContentType()).thenReturn("image/jpeg");
        when(multipartFile.getOriginalFilename()).thenReturn("test.jpg");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(cloudinaryResponse);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertNotNull(result);
        assertEquals("IMAGE", result.messageType());
        assertEquals("realtimechat/test", result.publicId());
        assertTrue(result.url().contains("fl_attachment"));
    }

    @Test
    void testUploadFile_ImagePng_Success() throws Exception {
        when(multipartFile.getContentType()).thenReturn("image/png");
        when(multipartFile.getOriginalFilename()).thenReturn("photo.png");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(cloudinaryResponse);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertEquals("IMAGE", result.messageType());
    }

    @Test
    void testUploadFile_NullContentType_FallsBackToImage() throws Exception {
        // contentType null → "" → no empieza por "video"/"audio" → IMAGE
        when(multipartFile.getContentType()).thenReturn(null);
        when(multipartFile.getOriginalFilename()).thenReturn("test.jpg");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(cloudinaryResponse);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertEquals("IMAGE", result.messageType());
    }

    @Test
    void testUploadFile_NullFilename_FallsBackToImage() throws Exception {
        when(multipartFile.getContentType()).thenReturn("image/png");
        when(multipartFile.getOriginalFilename()).thenReturn(null);
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(cloudinaryResponse);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertEquals("IMAGE", result.messageType());
    }

    // -------------------------------------------------------------------------
    // VIDEO
    // -------------------------------------------------------------------------

    @Test
    void testUploadFile_VideoMp4_Success() throws Exception {
        when(multipartFile.getContentType()).thenReturn("video/mp4");
        when(multipartFile.getOriginalFilename()).thenReturn("test.mp4");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(cloudinaryResponse);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertEquals("VIDEO", result.messageType());
    }

    @Test
    void testUploadFile_Video_UsesVideoResourceType() throws Exception {
        when(multipartFile.getContentType()).thenReturn("video/mp4");
        when(multipartFile.getOriginalFilename()).thenReturn("test.mp4");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(cloudinaryResponse);

        uploadService.uploadFile(multipartFile);

        verify(uploader).upload(any(byte[].class), argThat(map ->
                "video".equals(map.get("resource_type")) &&
                "realtimechat".equals(map.get("folder"))
        ));
    }

    // -------------------------------------------------------------------------
    // AUDIO
    // -------------------------------------------------------------------------

    @Test
    void testUploadFile_AudioMpeg_Success() throws Exception {
        when(multipartFile.getContentType()).thenReturn("audio/mpeg");
        when(multipartFile.getOriginalFilename()).thenReturn("test.mp3");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(cloudinaryResponse);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertEquals("AUDIO", result.messageType());
    }

    @Test
    void testUploadFile_AudioWav_Success() throws Exception {
        when(multipartFile.getContentType()).thenReturn("audio/wav");
        when(multipartFile.getOriginalFilename()).thenReturn("test.wav");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(cloudinaryResponse);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertEquals("AUDIO", result.messageType());
    }

    @Test
    void testUploadFile_WebmExtension_DetectedAsAudio() throws Exception {
        // .webm con contentType genérico → detectado por extensión
        when(multipartFile.getContentType()).thenReturn("application/octet-stream");
        when(multipartFile.getOriginalFilename()).thenReturn("recording.webm");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(cloudinaryResponse);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertEquals("AUDIO", result.messageType());
    }

    @Test
    void testUploadFile_Mp3Extension_DetectedAsAudio() throws Exception {
        when(multipartFile.getContentType()).thenReturn("application/octet-stream");
        when(multipartFile.getOriginalFilename()).thenReturn("song.mp3");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(cloudinaryResponse);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertEquals("AUDIO", result.messageType());
    }

    @Test
    void testUploadFile_OggExtension_DetectedAsAudio() throws Exception {
        when(multipartFile.getContentType()).thenReturn("application/octet-stream");
        when(multipartFile.getOriginalFilename()).thenReturn("track.ogg");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(cloudinaryResponse);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertEquals("AUDIO", result.messageType());
    }

    @Test
    void testUploadFile_Audio_UsesRawResourceType() throws Exception {
        when(multipartFile.getContentType()).thenReturn("audio/mpeg");
        when(multipartFile.getOriginalFilename()).thenReturn("test.mp3");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(cloudinaryResponse);

        uploadService.uploadFile(multipartFile);

        verify(uploader).upload(any(byte[].class), argThat(map ->
                "raw".equals(map.get("resource_type")) &&
                "realtimechat".equals(map.get("folder"))
        ));
    }

    // -------------------------------------------------------------------------
    // FILE (PDF)
    // -------------------------------------------------------------------------

    @Test
    void testUploadFile_Pdf_Success() throws Exception {
        when(multipartFile.getContentType()).thenReturn("application/pdf");
        when(multipartFile.getOriginalFilename()).thenReturn("document.pdf");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(cloudinaryResponse);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertEquals("FILE", result.messageType());
    }

    @Test
    void testUploadFile_Pdf_UsesRawResourceType() throws Exception {
        when(multipartFile.getContentType()).thenReturn("application/pdf");
        when(multipartFile.getOriginalFilename()).thenReturn("document.pdf");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(cloudinaryResponse);

        uploadService.uploadFile(multipartFile);

        verify(uploader).upload(any(byte[].class), argThat(map ->
                "raw".equals(map.get("resource_type")) &&
                "realtimechat".equals(map.get("folder"))
        ));
    }

    // -------------------------------------------------------------------------
    // URL transformation
    // -------------------------------------------------------------------------

    @Test
    void testUploadFile_DownloadUrl_ContainsFlAttachment() throws Exception {
        when(multipartFile.getContentType()).thenReturn("image/jpeg");
        when(multipartFile.getOriginalFilename()).thenReturn("test.jpg");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3});
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(cloudinaryResponse);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        String originalUrl = (String) cloudinaryResponse.get("secure_url");
        assertTrue(result.url().contains("fl_attachment"));
        assertNotEquals(originalUrl, result.url());
        assertTrue(result.url().contains("/upload/fl_attachment/"));
    }
}