package com.realtimechat.backend.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.realtimechat.backend.controllers.FileController;
import com.realtimechat.backend.dtos.UploadResultDTO;
import com.realtimechat.backend.services.UploadService;

@ExtendWith(MockitoExtension.class)
class FileControllerTest {

    @Mock
    private UploadService uploadService;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private MultipartFile multipartFile;

    @InjectMocks
    private FileController fileController;

    @BeforeEach
    void setUp() {
    }

    @Test
    void testUpload_Success() throws Exception {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(1024L);

        UploadResultDTO uploadResult = new UploadResultDTO(
                "https://example.com/image.jpg",
                "public_id",
                "IMAGE");

        when(uploadService.uploadFile(multipartFile)).thenReturn(uploadResult);

        ResponseEntity<UploadResultDTO> response = fileController.upload(multipartFile);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("IMAGE", response.getBody().messageType());
        verify(uploadService, times(1)).uploadFile(multipartFile);
    }

    @Test
    void testUpload_EmptyFile() throws Exception {
        when(multipartFile.isEmpty()).thenReturn(true);

        ResponseEntity<UploadResultDTO> response = fileController.upload(multipartFile);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(uploadService, never()).uploadFile(any());
    }

    @Test
    void testUpload_FileTooLarge() throws Exception {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(11 * 1024 * 1024L);

        ResponseEntity<UploadResultDTO> response = fileController.upload(multipartFile);

        assertEquals(HttpStatus.CONTENT_TOO_LARGE, response.getStatusCode());
        verify(uploadService, never()).uploadFile(any());
    }

    @Test
    void testUpload_ExactlyMaxSize() throws Exception {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(10 * 1024 * 1024L);

        UploadResultDTO uploadResult = new UploadResultDTO(
                "https://example.com/file.pdf",
                "public_id",
                "FILE");

        when(uploadService.uploadFile(multipartFile)).thenReturn(uploadResult);

        ResponseEntity<UploadResultDTO> response = fileController.upload(multipartFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        verify(uploadService, times(1)).uploadFile(multipartFile);
    }

    @Test
    void testUpload_OneByteUnderMaxSize() throws Exception {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(10 * 1024 * 1024L - 1);

        UploadResultDTO uploadResult = new UploadResultDTO(
                "https://example.com/file.pdf",
                "public_id",
                "FILE");

        when(uploadService.uploadFile(multipartFile)).thenReturn(uploadResult);

        ResponseEntity<UploadResultDTO> response = fileController.upload(multipartFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void testDownload_Success() throws Exception {
        byte[] fileBytes = new byte[]{1, 2, 3, 4, 5};
        when(restTemplate.getForObject("http://example.com/file.jpg", byte[].class))
                .thenReturn(fileBytes);

        ResponseEntity<byte[]> response = fileController.download("http://example.com/file.jpg", "test.jpg");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertArrayEquals(fileBytes, response.getBody());
        assertTrue(response.getHeaders().getFirst("Content-Disposition").contains("attachment"));
        verify(restTemplate, times(1)).getForObject("http://example.com/file.jpg", byte[].class);
    }

    @Test
    void testDownload_FileNotFound() throws Exception {
        when(restTemplate.getForObject("http://example.com/notfound.jpg", byte[].class))
                .thenReturn(null);

        ResponseEntity<byte[]> response = fileController.download("http://example.com/notfound.jpg", "test.jpg");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void testDownload_WithSpecialCharactersInFilename() throws Exception {
        byte[] fileBytes = new byte[]{1, 2, 3, 4, 5};
        when(restTemplate.getForObject("http://example.com/file.jpg", byte[].class))
                .thenReturn(fileBytes);

        ResponseEntity<byte[]> response = fileController.download("http://example.com/file.jpg", "tëst filé.jpg");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        String contentDisposition = response.getHeaders().getFirst("Content-Disposition");
        assertTrue(contentDisposition.contains("attachment"));
        assertTrue(contentDisposition.contains("UTF-8"));
    }

    @Test
    void testDownload_CorrectContentType() throws Exception {
        byte[] fileBytes = new byte[]{1, 2, 3, 4, 5};
        when(restTemplate.getForObject("http://example.com/file.pdf", byte[].class))
                .thenReturn(fileBytes);

        ResponseEntity<byte[]> response = fileController.download("http://example.com/file.pdf", "document.pdf");

        assertNotNull(response);
        assertEquals("application/octet-stream", response.getHeaders().getFirst("Content-Type"));
    }

    @Test
    void testUpload_VideoFile() throws Exception {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(5 * 1024 * 1024L);

        UploadResultDTO uploadResult = new UploadResultDTO(
                "https://example.com/video.mp4",
                "public_id",
                "VIDEO");

        when(uploadService.uploadFile(multipartFile)).thenReturn(uploadResult);

        ResponseEntity<UploadResultDTO> response = fileController.upload(multipartFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("VIDEO", response.getBody().messageType());
    }

    @Test
    void testUpload_AudioFile() throws Exception {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getSize()).thenReturn(2 * 1024 * 1024L);

        UploadResultDTO uploadResult = new UploadResultDTO(
                "https://example.com/audio.mp3",
                "public_id",
                "AUDIO");

        when(uploadService.uploadFile(multipartFile)).thenReturn(uploadResult);

        ResponseEntity<UploadResultDTO> response = fileController.upload(multipartFile);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("AUDIO", response.getBody().messageType());
    }

    @Test
    void testDownload_LargeFile() throws Exception {
        byte[] largeFileBytes = new byte[5 * 1024 * 1024];
        when(restTemplate.getForObject("http://example.com/largefile.bin", byte[].class))
                .thenReturn(largeFileBytes);

        ResponseEntity<byte[]> response = fileController.download("http://example.com/largefile.bin", "largefile.bin");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(largeFileBytes.length, response.getBody().length);
    }
}
