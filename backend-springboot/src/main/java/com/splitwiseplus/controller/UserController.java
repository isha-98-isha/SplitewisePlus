package com.splitwiseplus.controller;

import com.splitwiseplus.model.User;
import com.splitwiseplus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.authentication.AuthenticationManager authenticationManager;

    @Autowired
    private com.splitwiseplus.security.JwtUtils jwtUtils;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder encoder;

    @PostMapping("/login")
    public org.springframework.http.ResponseEntity<?> authenticateUser(@RequestBody java.util.Map<String, String> loginRequest) {
        try {
            org.springframework.security.core.Authentication authentication = authenticationManager.authenticate(
                    new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(loginRequest.get("email"), loginRequest.get("password")));

            org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(loginRequest.get("email"));
            
            com.splitwiseplus.security.UserDetailsImpl userDetails = (com.splitwiseplus.security.UserDetailsImpl) authentication.getPrincipal();
            
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("token", jwt);
            response.put("_id", userDetails.getId());
            response.put("name", userDetails.getName());
            response.put("email", userDetails.getUsername());
            response.put("role", userDetails.getRole());
            
            return org.springframework.http.ResponseEntity.ok(response);
        } catch (org.springframework.security.core.AuthenticationException e) {
            return org.springframework.http.ResponseEntity.status(401).body(java.util.Map.of("message", "Invalid Credentials"));
        }
    }

    @PostMapping("/register")
    public org.springframework.http.ResponseEntity<?> registerUser(@RequestBody User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return org.springframework.http.ResponseEntity.badRequest().body(java.util.Map.of("message", "User already exists"));
        }
        user.setPassword(encoder.encode(user.getPassword()));
        userRepository.save(user);
        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "User registered successfully!"));
    }

    @GetMapping("/")
    public List<User> getUsers() {
        return userRepository.findAll();
    }

    @PostMapping("/forgot-password")
    public org.springframework.http.ResponseEntity<?> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            String token = java.util.UUID.randomUUID().toString();
            user.setResetPasswordToken(token);
            user.setResetPasswordExpire(new java.util.Date(System.currentTimeMillis() + 3600000)); // 1 hour
            userRepository.save(user);
            
            java.util.Map<String, String> response = new java.util.HashMap<>();
            response.put("message", "Reset link generated");
            response.put("resetToken", token);
            return org.springframework.http.ResponseEntity.ok(response);
        }
        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "Reset link sent if email exists"));
    }

    @PostMapping("/reset-password")
    public org.springframework.http.ResponseEntity<?> resetPassword(@RequestBody java.util.Map<String, String> request) {
        String token = request.get("token");
        String password = request.get("password");
        
        User user = userRepository.findByResetPasswordToken(token).orElse(null);
        if (user == null) {
            return org.springframework.http.ResponseEntity.badRequest().body(java.util.Map.of("message", "Invalid token"));
        }
        
        if (user.getResetPasswordExpire() != null && user.getResetPasswordExpire().before(new java.util.Date())) {
            return org.springframework.http.ResponseEntity.badRequest().body(java.util.Map.of("message", "Token expired"));
        }
        
        user.setPassword(encoder.encode(password));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpire(null);
        userRepository.save(user);
        
        return org.springframework.http.ResponseEntity.ok(java.util.Map.of("message", "Password reset successful"));
    }

    @SuppressWarnings("null")
    @GetMapping("/{id}")
    public User getUserById(@PathVariable String id) {
        return userRepository.findById(id).orElse(null);
    }

    @PutMapping("/update-profile")
    public User updateProfile(@RequestBody User userDetails) {
        // In a real app, get user from security context
        User user = userRepository.findByEmail(userDetails.getEmail()).orElse(null);
        if (user != null) {
            user.setName(userDetails.getName());
            return userRepository.save(user);
        }
        return null;
    }
}
