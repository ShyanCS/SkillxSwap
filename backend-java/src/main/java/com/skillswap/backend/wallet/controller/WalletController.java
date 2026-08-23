package com.skillswap.backend.wallet.controller;

import com.skillswap.backend.auth.security.CustomUserDetails;
import com.skillswap.backend.wallet.dto.WalletResponse;
import com.skillswap.backend.wallet.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public WalletResponse getWallet(@AuthenticationPrincipal CustomUserDetails principal) {
        return walletService.getWallet(principal.getId());
    }
}
