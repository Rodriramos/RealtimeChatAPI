package com.realtimechat.backend;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.realtimechat.backend.entities.Room;
import com.realtimechat.backend.repositories.RoomRepository;

@SpringBootApplication
public class BackendApplication implements CommandLineRunner {

	private final RoomRepository roomRepository;

	public BackendApplication(RoomRepository roomRepository) {
		this.roomRepository = roomRepository;
	}

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	private static final List<String> THEMATIC_ROOMS = List.of("Tecnología", "Deportes", "Música", "Cine", "Viajes");

	public void run(String... args) throws Exception {
		System.out.println("Backend application started.");

		// Global chat room initialization
		boolean exists = roomRepository.existsByType(Room.RoomType.GLOBAL);
		if (!exists) {
			Room globalRoom = buildRoom("Global Room", Room.RoomType.GLOBAL);
			roomRepository.save(globalRoom);
			System.out.println("Global room created.");
		} else {
			System.out.println("Global room already exists.");
		}

		// Thematic rooms initialization
		THEMATIC_ROOMS.forEach(name -> {
			boolean thematicExists = roomRepository.existsByNameAndType(name, Room.RoomType.THEMATIC);
			if (!thematicExists) {
				Room thematicRoom = buildRoom(name, Room.RoomType.THEMATIC);
				roomRepository.save(thematicRoom);
				System.out.println("Thematic room '" + name + "' created.");
			} else {
				System.out.println("Thematic room '" + name + "' already exists.");
			}
		});
	}

	private Room buildRoom(String name, Room.RoomType type) {
		Room room = new Room();
		room.setName(name);
		room.setType(type);
		return room;
	}

}
