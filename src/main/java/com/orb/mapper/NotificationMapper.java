package com.orb.mapper;

import com.orb.dto.NotificationDTO;
import com.orb.entity.Notification;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationDTO toDTO(Notification notification);
}
