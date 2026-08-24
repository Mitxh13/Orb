package com.orb.mapper;

import com.orb.dto.WalletDTO;
import com.orb.entity.Wallet;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface WalletMapper {
    WalletDTO toDTO(Wallet wallet);
}
