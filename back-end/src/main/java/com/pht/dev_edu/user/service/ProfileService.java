package com.pht.dev_edu.user.service;

/**
 * Service for managing user profile details, password updates, and avatar uploads.
 */
public interface ProfileService {

    /**
     * Changes the password of an existing user account after verifying the current password.
     *
     * @param username    the username of the user.
     * @param oldPassword the current password.
     * @param newPassword the new password to set.
     */
    void changePassword(String username, String oldPassword, String newPassword);

    /**
     * Sets the initial username for a user who logged in via Google OAuth2 for the first time.
     *
     * @param email    the email address associated with the Google account.
     * @param username the newly chosen username.
     */
    void setUsernameForGoogleLogin(String email, String username);

    /**
     * Updates the avatar image for a user.
     *
     * @param username        the username of the user.
     * @param avatarObjectKey the storage object key of the uploaded avatar image.
     * @return the public access URL of the new avatar.
     */
    String updateAvatar(String username, String avatarObjectKey);
}
