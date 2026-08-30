package com.pht.dev_edu.user.service;

import com.pht.dev_edu.common.dto.CustomPaging;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.user.dto.RegisterUser;
import com.pht.dev_edu.user.dto.UserInfoResponse;
import com.pht.dev_edu.user.entity.UserEntity;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service for managing user accounts, authentication data, registration, and user search queries.
 */
public interface UserService {

    /**
     * Finds a user entity by username (cached).
     *
     * @param username the username to look up.
     * @return the {@link UserEntity} or null if not found.
     */
    UserEntity findByUsername(String username);

    /**
     * Finds a user entity by email (cached).
     *
     * @param email the email address to look up.
     * @return the {@link UserEntity} or null if not found.
     */
    UserEntity findByEmail(String email);

    /**
     * Searches and paginates users by keyword and role.
     *
     * @param keyword  the search keyword matching name, username, or email.
     * @param role     the {@link RoleEnum} filter.
     * @param pageable the {@link Pageable} pagination configuration.
     * @return a {@link CustomPaging} of {@link UserInfoResponse} items.
     */
    CustomPaging<UserInfoResponse> searchUsers(String keyword, RoleEnum role, Pageable pageable);

    /**
     * Registers a new user in the system.
     *
     * @param registerUser the {@link RegisterUser} payload containing registration details.
     */
    void registerUser(RegisterUser registerUser);

    /**
     * Registers multiple users in batch mode.
     *
     * @param registerUsers the list of {@link RegisterUser} objects to register.
     */
    void batchRegisterUsers(List<RegisterUser> registerUsers);
}
