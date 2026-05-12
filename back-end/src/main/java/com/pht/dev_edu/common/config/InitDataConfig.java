package com.pht.dev_edu.common.config;

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.security.OAuth2PasswordGrantAuthenticationConverter;
import com.pht.dev_edu.user.dto.RegisterUser;
import com.pht.dev_edu.user.entity.RoleEntity;
import com.pht.dev_edu.user.repo.RoleRepository;
import com.pht.dev_edu.user.repo.UserRepository;
import com.pht.dev_edu.user.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.OidcScopes;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.settings.ClientSettings;
import org.springframework.security.oauth2.server.authorization.settings.TokenSettings;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;

@Slf4j
@Configuration
public class InitDataConfig {
    @Value("${custom.oauth2.login-success-url}")
    String loginSuccessUrl;

    @Bean
    @Transactional
    @Order(0)
    CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            if (roleRepository.count() != 0) {
                return;
            }

            List<RoleEntity> defaultRoles = List.of(
                    RoleEntity.builder()
                            .name(RoleEnum.STUDENT)
                            .description("Default role for students")
                            .build(),
                    RoleEntity.builder()
                            .name(RoleEnum.LECTURER)
                            .description("Default role for lecturers")
                            .build(),
                    RoleEntity.builder()
                            .name(RoleEnum.ADMIN)
                            .description("Default role for administrators")
                            .build()
            );

            roleRepository.saveAll(defaultRoles);
        };
    }

    @Bean
    @Order(1)
    CommandLineRunner initUsers(
            UserRepository userRepository,
            UserService userService
    ) {
        return args -> {
            var totalUsers = userRepository.count();
            log.info("Total users in database: {}", totalUsers);
            if (totalUsers != 0) {
                return;
            }

            log.info("Initializing default users...");
            var defaultUsers = List.of(
                    RegisterUser.builder()
                            .username("admin")
                            .email("phamtruong04112004@gmail.com")
                            .password("Admin@123")
                            .fullName("Admin User")
                            .role(RoleEnum.ADMIN)
                            .build(),
                    RegisterUser.builder()
                            .username("lecturer")
                            .email("anninhxom911@gmail.com")
                            .password("Lecturer@123")
                            .fullName("Lecturer User")
                            .role(RoleEnum.LECTURER)
                            .build(),
                    RegisterUser.builder()
                            .username("student")
                            .email("phtruong04112004@gmail.com")
                            .password("Student@123")
                            .fullName("Student User")
                            .role(RoleEnum.STUDENT)
                            .build()
            );
            userService.batchRegisterUsers(defaultUsers);

            log.info("Default users initialized successfully");
        };
    }

    @Bean
    @Transactional
    @Order(2)
    CommandLineRunner initRegisteredClients(
            RegisteredClientRepository repository,
            JdbcTemplate jdbcTemplate,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            String sql = "SELECT COUNT(*) FROM oauth2_registered_client";
            var totalClients = jdbcTemplate.queryForObject(sql, Long.class);
            log.info("Total clients in database: {}", totalClients);

            if (totalClients == null || totalClients != 0) {
                return;
            }

            RegisteredClient webClient = RegisteredClient
                    .withId(UuidCreator.getTimeOrderedEpoch().toString())
                    .clientId("web_client")
                    .clientSecret(passwordEncoder.encode("web_client_secret"))
                    .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                    .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                    .authorizationGrantType(AuthorizationGrantType.REFRESH_TOKEN)
                    .authorizationGrantType(OAuth2PasswordGrantAuthenticationConverter.PASSWORD_GRANT_TYPE)
                    .redirectUri(loginSuccessUrl)
                    .scope(OidcScopes.OPENID)
                    .scope(OidcScopes.PROFILE)
                    .tokenSettings(TokenSettings.builder()
                            .accessTokenTimeToLive(Duration.ofMinutes(5))
                            .refreshTokenTimeToLive(Duration.ofDays(1))
                            .reuseRefreshTokens(false)
                            .build())
                    .clientSettings(ClientSettings.builder()
                            .requireAuthorizationConsent(true)
                            .requireProofKey(true)
                            .build())
                    .build();

            repository.save(webClient);
        };
    }
}
