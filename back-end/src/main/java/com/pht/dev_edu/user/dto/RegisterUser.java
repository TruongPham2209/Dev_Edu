package com.pht.dev_edu.user.dto;

import com.pht.dev_edu.common.dto.RoleEnum;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class RegisterUser {
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
    @NotBlank(message = "Username is required")
    String username;

    @Email(message = "Email should be valid")
    @NotBlank(message = "Email is required")
    String email;

    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
             message = "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character")
    @NotBlank(message = "Password is required")
    String password;

    @NotBlank(message = "Full name is required")
    String fullName;

    RoleEnum role;
}
