package com.pht.dev_edu.common.security;

import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import java.util.function.Consumer;

@Component
public class Oauth2UserRepoHandler implements Consumer<OAuth2User> {

    @Override
    public void accept(OAuth2User t) {
        // TODO: implement login with Oauth2User, and save user info to database if not exist
        throw new UnsupportedOperationException("Not implemented yet");
    }

}
