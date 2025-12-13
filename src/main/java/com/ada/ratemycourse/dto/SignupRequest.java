package com.ada.ratemycourse.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SignupRequest {
    @Email
    @NotBlank
    @Pattern(regexp = ".*@ada\\.edu\\.az$", message = "Must be an ADA email")
    private String email;

    @NotBlank
    private String password;
}
