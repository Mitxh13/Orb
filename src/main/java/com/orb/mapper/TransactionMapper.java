package com.orb.mapper;

import com.orb.dto.TransactionDTO;
import com.orb.entity.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TransactionMapper {

    @Mapping(source = "senderWallet.walletTag", target = "senderWalletTag")
    @Mapping(source = "receiverWallet.walletTag", target = "receiverWalletTag")
    @Mapping(target = "direction", ignore = true)
    TransactionDTO toDTO(Transaction transaction);
}
