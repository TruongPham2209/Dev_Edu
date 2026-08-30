package com.pht.dev_edu.common.config;

import java.time.Duration;
import java.util.List;

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

import com.github.f4b6a3.uuid.UuidCreator;
import com.pht.dev_edu.chat.service.CourseEmbeddingService;
import com.pht.dev_edu.common.dto.RoleEnum;
import com.pht.dev_edu.common.security.OAuth2PasswordGrantAuthenticationConverter;
import com.pht.dev_edu.forum.repo.PostElasticsearchRepository;
import com.pht.dev_edu.user.dto.RegisterUser;
import com.pht.dev_edu.user.entity.RoleEntity;
import com.pht.dev_edu.user.repo.RoleRepository;
import com.pht.dev_edu.user.repo.UserRepository;
import com.pht.dev_edu.user.service.UserService;

import lombok.extern.slf4j.Slf4j;

/**
 * Configuration class housing application startup {@link CommandLineRunner} beans.
 *
 * <p>Executes foundational bootstrapping tasks in a strictly ordered sequence:
 * <ol>
 *   <li>{@link #initRoles(RoleRepository)} (Order 0): Seeds default authorization roles (STUDENT, LECTURER, ADMIN).</li>
 *   <li>{@link #initUsers(UserRepository, UserService)} (Order 1): Seeds bootstrap admin, lecturer, and student users.</li>
 *   <li>{@link #initRegisteredClients(RegisteredClientRepository, JdbcTemplate, PasswordEncoder)} (Order 2): Registers default OAuth2 / OIDC client credentials and token policies.</li>
 *   <li>{@link #syncPostToElastic(PostElasticsearchRepository)} (Order 3): Synchronizes PostgreSQL forum posts into Elasticsearch.</li>
 *   <li>{@link #syncCourseEmbeddings(CourseEmbeddingService)} (Order 4): Generates and stores missing course vector embeddings in pgvector.</li>
 * </ol>
 *
 * @author Dev_Edu Team
 * @see CommandLineRunner
 * @see RoleRepository
 * @see UserRepository
 * @see RegisteredClientRepository
 * @see PostElasticsearchRepository
 * @see CourseEmbeddingService
 */
@Slf4j
@Configuration
public class InitDataConfig {
    @Value("${custom.oauth2.login-success-url}")
    String loginSuccessUrl;

    /**
     * Initializes default system roles if the role table is empty.
     *
     * <p><b>Execution Order:</b> 0 (First startup runner)<br>
     * <b>Roles seeded:</b> {@link RoleEnum#STUDENT}, {@link RoleEnum#LECTURER}, {@link RoleEnum#ADMIN}.
     *
     * @param roleRepository JPA repository for role management
     * @return {@link CommandLineRunner} callback bean
     */
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

    /**
     * Initializes default bootstrap users for development and admin access if the user table is empty.
     *
     * <p><b>Execution Order:</b> 1<br>
     * <b>Default Accounts:</b>
     * <ul>
     *   <li>{@code admin} with {@link RoleEnum#ADMIN}</li>
     *   <li>{@code lecturer} with {@link RoleEnum#LECTURER}</li>
     *   <li>{@code student} with {@link RoleEnum#STUDENT}</li>
     * </ul>
     *
     * @param userRepository JPA repository for user lookup and count
     * @param userService    user registration service
     * @return {@link CommandLineRunner} callback bean
     */
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

    /**
     * Initializes the default Spring Authorization Server RegisteredClient entry for the frontend web client.
     *
     * <p><b>Execution Order:</b> 2<br>
     * <b>Client Configuration:</b>
     * <ul>
     *   <li>Client ID: {@code web_client}</li>
     *   <li>Grant Types: {@code authorization_code}, {@code refresh_token}, custom {@code password}</li>
     *   <li>Access Token TTL: 5 minutes</li>
     *   <li>Refresh Token TTL: 1 day</li>
     *   <li>PKCE & Authorization Consent: Required</li>
     * </ul>
     *
     * @param repository      Spring Security Authorization Server client repository
     * @param jdbcTemplate    JDBC template for count query check
     * @param passwordEncoder BCrypt password encoder for hashing client secrets
     * @return {@link CommandLineRunner} callback bean
     */
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

    /**
     * Synchronizes existing forum posts from the database into the Elasticsearch index at application startup.
     *
     * <p><b>Execution Order:</b> 3
     *
     * @param postElasticsearchRepository Elasticsearch synchronization repository
     * @return {@link CommandLineRunner} callback bean
     */
    @Bean
    @Transactional
    @Order(3)
    CommandLineRunner syncPostToElastic(PostElasticsearchRepository postElasticsearchRepository) {
        return args -> {
            postElasticsearchRepository.syncAllToElasticsearch();
        };
    }

    /**
     * Checks all courses and generates missing vector embeddings stored in PostgreSQL using {@code pgvector}.
     *
     * <p><b>Execution Order:</b> 4
     *
     * @param courseEmbeddingService course embedding management service
     * @return {@link CommandLineRunner} callback bean
     */
    @Bean
    @Transactional
    @Order(4)
    CommandLineRunner syncCourseEmbeddings(CourseEmbeddingService courseEmbeddingService) {
        return args -> {
            log.info("Checking and syncing missing course embeddings to pgvector...");
            courseEmbeddingService.syncAllCourseEmbeddings();
        };
    }
}
