package com.ada.ratemycourse.service;

import com.ada.ratemycourse.dto.AuthResponse;
import com.ada.ratemycourse.dto.LoginRequest;
import com.ada.ratemycourse.dto.SignupRequest;
import com.ada.ratemycourse.dto.UserResponse;
import com.ada.ratemycourse.model.User;
import jakarta.validation.Valid;

public interface AuthService {
    AuthResponse signup(@Valid SignupRequest request);

    AuthResponse login(@Valid LoginRequest request);

    UserResponse getCurrentUser(String email);

    User getUserByEmail(String email);
}
