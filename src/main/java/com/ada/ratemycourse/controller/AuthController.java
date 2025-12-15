package com.ada.ratemycourse.controller;

import com.ada.ratemycourse.dto.AuthResponse;
import com.ada.ratemycourse.dto.LoginRequest;
import com.ada.ratemycourse.dto.SignupRequest;
import com.ada.ratemycourse.dto.UserResponse;
import com.ada.ratemycourse.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest request,
                                    HttpServletRequest httpRequest) {
        try {
            AuthResponse response = authService.signup(request);

            Authentication authentication =
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            null,
                            List.of() // role-lar varsa buraya
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            // Create session
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(
                    "SPRING_SECURITY_CONTEXT",
                    SecurityContextHolder.getContext()
            );
            session.setAttribute("user_email", request.getEmail());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new AuthResponse(null, e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request,
                                   HttpServletRequest httpRequest) {
        try {
            AuthResponse response = authService.login(request);

            Authentication authentication =
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            null,
                            List.of() // role-lar varsa buraya
                    );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            // Create session
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute(
                    "SPRING_SECURITY_CONTEXT",
                    SecurityContextHolder.getContext()
            );
            session.setAttribute("user_email", request.getEmail());

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<AuthResponse> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.ok(new AuthResponse(null, "Logged out successfully"));
    }

    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("user_email") == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, "Not authenticated"));
        }

        String email = (String) session.getAttribute("user_email");
        UserResponse user = authService.getCurrentUser(email);
        return ResponseEntity.ok(user);
    }
}