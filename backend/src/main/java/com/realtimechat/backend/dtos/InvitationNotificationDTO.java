package com.realtimechat.backend.dtos;

public record InvitationNotificationDTO(
    Long roomId,
    String roomName,
    String invitedBy
) {

}
