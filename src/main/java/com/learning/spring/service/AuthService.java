package com.learning.spring.service;


import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;

import com.learning.spring.dto.LoginRequest;
import com.learning.spring.dto.RegisterRequest;
import com.learning.spring.entity.User;
import com.learning.spring.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public String register(RegisterRequest request) {

        if(userRepository.findByEmail(request.getEmail()).isPresent()) {
            return "Email already exists";
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        userRepository.save(user);

        return "User Registered Successfully";
    }
    
    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if(user == null) {
            return "User not found";
        }

        boolean isMatch = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if(!isMatch) {
            return "Invalid Password";
        }

        return "Login Successful";
    }
}