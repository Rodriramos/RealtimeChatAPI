package com.realtimechat.backend.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.realtimechat.backend.entities.RoomMember;

@Repository
public interface RoomMemberRepository extends JpaRepository<RoomMember, Long> {
    boolean existsByRoomIdAndUserId(Long roomId, Long userId);
    List<RoomMember> findByUserIdAndSeenAtIsNull(Long userId);
    List<RoomMember> findByUserId(Long userId);
}
