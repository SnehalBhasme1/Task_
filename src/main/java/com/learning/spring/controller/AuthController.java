package com.learning.spring.controller;

import org.springframework.web.bind.annotation.*;

import com.learning.spring.dto.LoginRequest;
import com.learning.spring.dto.RegisterRequest;
import com.learning.spring.service.AuthService;
@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }
    
    @PostMapping("/login")
    public String login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }
}