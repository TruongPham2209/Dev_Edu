package com.pht.dev_edu.common.config;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.pht.dev_edu.common.constant.RedisDurationConstant;
import com.pht.dev_edu.common.constant.WebEndpointConstant;
import com.pht.dev_edu.common.security.*;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.authorization.JdbcOAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.OAuth2AuthorizationService;
import org.springframework.security.oauth2.server.authorization.client.JdbcRegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClient;
import org.springframework.security.oauth2.server.authorization.client.RegisteredClientRepository;
import org.springframework.security.oauth2.server.authorization.config.annotation.web.configurers.OAuth2AuthorizationServerConfigurer;
import org.springframework.security.oauth2.server.authorization.token.OAuth2TokenGenerator;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.OrRequestMatcher;
import org.springframework.security.web.util.matcher.RegexRequestMatcher;
import org.springframework.web.cors.CorsConfigurationSource;

@Slf4j
@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthorizationServerConfig {
    CorsConfigurationSource corsConfigurationSource;
    AuthEntryPointHandler authenticationEntryPoint;
    AuthEntryPointHandler entryPointHandler;
    AuthFailureHandler authFailureHandler;
    PasswordEncoder passwordEncoder;
    LoggingSecurityFilter loggingSecurityFilter;

    @NonFinal
    @Value("${custom.oauth2.login-success-url}")
    String loginSuccessUrl;

    @NonFinal
    @Value("${custom.oauth2.logout-success-url}")
    String logoutSuccessUrl;

    @Bean
    @Order(1)
    SecurityFilterChain authorizationServerSecurityFilterChain(HttpSecurity http,
                                                               UserDetailsService userDetailsService,
                                                               OAuth2AuthorizationService authorizationService,
                                                               OAuth2TokenGenerator<?> tokenGenerator) throws Exception {
        OAuth2AuthorizationServerConfigurer authorizationServerConfigurer =
                new OAuth2AuthorizationServerConfigurer();

        http
                .securityMatcher(authorizationServerConfigurer.getEndpointsMatcher())
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(csrf -> csrf.ignoringRequestMatchers(
                        WebEndpointConstant.CSRF_IGNORING_MATCHERS.toArray(new String[0])
                ))
                .with(authorizationServerConfigurer, (authorizationServer) ->
                        authorizationServer
                                .oidc(Customizer.withDefaults())// Enable OpenID Connect 1.0
                                .tokenEndpoint(tokenEndpoint -> {
                                    // Password grant converter và provider
                                    tokenEndpoint.accessTokenRequestConverter(new OAuth2PasswordGrantAuthenticationConverter());
                                    tokenEndpoint.authenticationProvider(new OAuth2PasswordGrantAuthenticationProvider(userDetailsService, passwordEncoder, authorizationService, tokenGenerator));
                                })
                )
                .authorizeHttpRequests(authorize -> {
                    authorize.anyRequest().authenticated();
                })
                .oauth2ResourceServer(oauthResource -> oauthResource
                        .jwt(Customizer.withDefaults())
                        .authenticationEntryPoint(authenticationEntryPoint)
                ).exceptionHandling(ex -> {
                    ex.authenticationEntryPoint(entryPointHandler);
                });

        return http.build();
    }

    @Bean
    @Order(2)
    SecurityFilterChain webSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> {
                    cors.configurationSource(corsConfigurationSource);
                })
                .csrf(csrf -> csrf.ignoringRequestMatchers(
                        WebEndpointConstant.CSRF_IGNORING_MATCHERS.toArray(new String[0])
                ))
                .authorizeHttpRequests(authorize -> {
                    authorize.requestMatchers(
                            WebEndpointConstant.PERMIT_ALL_MATCHERS.toArray(new String[0])
                    ).permitAll();
                    authorize.requestMatchers(
                            HttpMethod.GET,
                            WebEndpointConstant.GET_PERMIT_ALL_ENDPOINTS.toArray(new String[0])
                    ).permitAll();
                    authorize.requestMatchers("/api/clients/**").hasAuthority("ADMIN");
                    authorize.anyRequest().authenticated();
                })
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .formLogin(login -> {
                    login.loginPage("/login");
                    login.loginProcessingUrl("/login");
                    login.passwordParameter("password");
                    login.usernameParameter("username");
                    login.defaultSuccessUrl(loginSuccessUrl);
                    login.failureHandler(authFailureHandler);
                })
                .httpBasic(AbstractHttpConfigurer::disable)
                .logout(logout -> {
                    logout.deleteCookies("JSESSIONID");
                    logout.invalidateHttpSession(true);
                    logout.logoutUrl("/logout");
                    logout.logoutRequestMatcher(new OrRequestMatcher(new RegexRequestMatcher("/logout", "GET")));
                    logout.clearAuthentication(true);
                    logout.logoutSuccessHandler((request, response, authentication) -> {
                        response.sendRedirect(logoutSuccessUrl);
                    });
                })
                .addFilterBefore(loggingSecurityFilter, BearerTokenAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public RegisteredClientRepository registeredClientRepository(
            JdbcTemplate jdbcTemplate
    ) {

        JdbcRegisteredClientRepository delegate =
                new JdbcRegisteredClientRepository(jdbcTemplate);

        Cache<String, RegisteredClient> clientIdCache =
                Caffeine.newBuilder()
                        .maximumSize(100)
                        .expireAfterWrite(
                                RedisDurationConstant.REGISTERED_CLIENT_DURATION
                        )
                        .build();

        Cache<String, RegisteredClient> idCache =
                Caffeine.newBuilder()
                        .maximumSize(100)
                        .expireAfterWrite(
                                RedisDurationConstant.REGISTERED_CLIENT_DURATION
                        )
                        .build();

        return new RegisteredClientRepository() {

            @Override
            public void save(RegisteredClient registeredClient) {
                delegate.save(registeredClient);

                clientIdCache.put(
                        registeredClient.getClientId(),
                        registeredClient
                );

                idCache.put(
                        registeredClient.getId(),
                        registeredClient
                );
            }

            @Override
            public RegisteredClient findById(String id) {
                return idCache.get(
                        id,
                        delegate::findById
                );
            }

            @Override
            public RegisteredClient findByClientId(String clientId) {
                return clientIdCache.get(
                        clientId,
                        delegate::findByClientId
                );
            }
        };
    }

    @Bean
    public OAuth2AuthorizationService oAuth2AuthorizationService(JdbcTemplate jdbcTemplate) {
        return new JdbcOAuth2AuthorizationService(jdbcTemplate, registeredClientRepository(jdbcTemplate));
    }
}
