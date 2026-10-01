package com.smartticket.services;

import com.smartticket.dto.AuthResponse;
import com.smartticket.dto.LoginRequest;
import com.smartticket.dto.RegisterRequest;
import com.smartticket.exception.BookingException;
import com.smartticket.model.User;
import com.smartticket.repository.UserRepository;
import com.smartticket.config.JwtConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtConfig jwtConfig;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BookingException("Email is already registered!");
        }

        User.Role role = User.Role.ROLE_USER;
        if (request.getRole() != null && request.getRole().equalsIgnoreCase("ADMIN")) {
            role = User.Role.ROLE_ADMIN;
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .build();

        userRepository.save(user);

        String token = jwtConfig.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BookingException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BookingException("Invalid email or password");
        }

        String token = jwtConfig.generateToken(user.getEmail(), user.getRole().name(), user.getId());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}
