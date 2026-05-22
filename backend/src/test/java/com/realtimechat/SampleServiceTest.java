package com.realtimechat;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

public class SampleServiceTest {
    @Test
    void sumaBasica() {
        int resultado = 2 + 2;
        assertEquals(4, resultado, "2 + 2 debe ser 4");
    }

    @Test
    void stringNoEsNulo() {
        String valor = "hola";
        assertNotNull(valor, "El string no debe ser nulo");
        assertFalse(valor.isEmpty(), "El string no debe estar vacío");
    }

    @Test
    void listaContieneElemento() {
        var lista = java.util.List.of("spring", "boot", "test");
        assertTrue(lista.contains("spring"), "La lista debe contener 'spring'");
        assertEquals(3, lista.size(), "La lista debe tener 3 elementos");
    }
}
