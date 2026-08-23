package com.skillswap.backend.wallet.dto;

import java.util.List;

public record WalletResponse(Integer balance, List<WalletTransactionResponse> transactions) {}
