package com.orb.mapper;

import com.orb.dto.UserDTO;
import com.orb.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserDTO toDTO(User user);
}
