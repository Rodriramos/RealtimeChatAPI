package com.realtimechat.backend;

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

	public void run(String... args) throws Exception {
		System.out.println("Backend application started.");

		boolean exists = roomRepository.existsByType(Room.RoomType.GLOBAL);
		if (!exists) {
			Room globalRoom = new Room();
			globalRoom.setName("Global Room");
			globalRoom.setType(Room.RoomType.GLOBAL);
			roomRepository.save(globalRoom);
			System.out.println("Global room created.");
		} else {
			System.out.println("Global room already exists.");
		}
	}

}
