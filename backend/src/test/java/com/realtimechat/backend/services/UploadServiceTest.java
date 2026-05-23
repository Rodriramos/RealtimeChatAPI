package com.realtimechat.backend.services;

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
import com.cloudinary.uploader.Uploader;
import com.realtimechat.backend.dtos.UploadResultDTO;
import com.realtimechat.backend.services.UploadService;

@ExtendWith(MockitoExtension.class)
class UploadServiceTest {

    @Mock
    private Cloudinary cloudinary;

    @Mock
    private Uploader uploader;

    @Mock
    private MultipartFile multipartFile;

    @InjectMocks
    private UploadService uploadService;

    private Map<String, Object> uploadResult;

    @BeforeEach
    void setUp() {
        uploadResult = new HashMap<>();
        uploadResult.put("secure_url", "https://res.cloudinary.com/example/upload/v1234/test.jpg");
        uploadResult.put("public_id", "example/test");
    }

    @Test
    void testUploadFile_ImageUpload_Success() throws Exception {
        when(multipartFile.getContentType()).thenReturn("image/jpeg");
        when(multipartFile.getOriginalFilename()).thenReturn("test.jpg");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3, 4});
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(uploadResult);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertNotNull(result);
        assertEquals("IMAGE", result.messageType());
        assertEquals("example/test", result.publicId());
        assertTrue(result.downloadUrl().contains("fl_attachment"));
    }

    @Test
    void testUploadFile_VideoUpload_Success() throws Exception {
        when(multipartFile.getContentType()).thenReturn("video/mp4");
        when(multipartFile.getOriginalFilename()).thenReturn("test.mp4");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3, 4});
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(uploadResult);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertNotNull(result);
        assertEquals("VIDEO", result.messageType());
        verify(cloudinary.uploader(), times(1)).upload(any(byte[].class), anyMap());
    }

    @Test
    void testUploadFile_AudioUpload_WithMp3Extension() throws Exception {
        when(multipartFile.getContentType()).thenReturn("audio/mpeg");
        when(multipartFile.getOriginalFilename()).thenReturn("test.mp3");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3, 4});
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(uploadResult);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertNotNull(result);
        assertEquals("AUDIO", result.messageType());
    }

    @Test
    void testUploadFile_AudioUpload_WithWebmExtension() throws Exception {
        when(multipartFile.getContentType()).thenReturn("application/octet-stream");
        when(multipartFile.getOriginalFilename()).thenReturn("test.webm");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3, 4});
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(uploadResult);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertNotNull(result);
        assertEquals("AUDIO", result.messageType());
    }

    @Test
    void testUploadFile_AudioUpload_WithOggExtension() throws Exception {
        when(multipartFile.getContentType()).thenReturn("application/octet-stream");
        when(multipartFile.getOriginalFilename()).thenReturn("test.ogg");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3, 4});
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(uploadResult);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertNotNull(result);
        assertEquals("AUDIO", result.messageType());
    }

    @Test
    void testUploadFile_PdfUpload_Success() throws Exception {
        when(multipartFile.getContentType()).thenReturn("application/pdf");
        when(multipartFile.getOriginalFilename()).thenReturn("document.pdf");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3, 4});
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(uploadResult);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertNotNull(result);
        assertEquals("FILE", result.messageType());
    }

    @Test
    void testUploadFile_NullContentType() throws Exception {
        when(multipartFile.getContentType()).thenReturn(null);
        when(multipartFile.getOriginalFilename()).thenReturn("test.jpg");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3, 4});
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(uploadResult);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertNotNull(result);
        assertEquals("IMAGE", result.messageType());
    }

    @Test
    void testUploadFile_NullFilename() throws Exception {
        when(multipartFile.getContentType()).thenReturn("image/png");
        when(multipartFile.getOriginalFilename()).thenReturn(null);
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3, 4});
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(uploadResult);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertNotNull(result);
        assertEquals("IMAGE", result.messageType());
    }

    @Test
    void testUploadFile_UrlTransformation() throws Exception {
        when(multipartFile.getContentType()).thenReturn("image/jpeg");
        when(multipartFile.getOriginalFilename()).thenReturn("test.jpg");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3, 4});
        when(cloudinary.uploader()).thenReturn(uploader);
        
        Map<String, Object> result = new HashMap<>(uploadResult);
        result.put("secure_url", "https://res.cloudinary.com/example/upload/v1234/test.jpg");
        
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(result);

        UploadResultDTO uploadResult = uploadService.uploadFile(multipartFile);

        assertNotNull(uploadResult);
        assertTrue(uploadResult.downloadUrl().contains("fl_attachment"));
        assertFalse(uploadResult.downloadUrl().equals(result.get("secure_url")));
    }

    @Test
    void testUploadFile_CloudinaryUploadCalled() throws Exception {
        when(multipartFile.getContentType()).thenReturn("image/jpeg");
        when(multipartFile.getOriginalFilename()).thenReturn("test.jpg");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3, 4});
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(uploadResult);

        uploadService.uploadFile(multipartFile);

        verify(uploader, times(1)).upload(any(byte[].class), argThat(map -> 
            map.get("resource_type").equals("image") && 
            map.get("folder").equals("realtimechat")
        ));
    }

    @Test
    void testUploadFile_AudioContentType_WithAudioPrefix() throws Exception {
        when(multipartFile.getContentType()).thenReturn("audio/wav");
        when(multipartFile.getOriginalFilename()).thenReturn("test.wav");
        when(multipartFile.getBytes()).thenReturn(new byte[]{1, 2, 3, 4});
        when(cloudinary.uploader()).thenReturn(uploader);
        when(uploader.upload(any(byte[].class), anyMap())).thenReturn(uploadResult);

        UploadResultDTO result = uploadService.uploadFile(multipartFile);

        assertNotNull(result);
        assertEquals("AUDIO", result.messageType());
    }
}
