package com.pht.dev_edu.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;

@Configuration
@EnableWebMvc
@EnableWebSecurity
public class WebConfig  implements WebMvcConfigurer {
    private static final List<String> ALLOWED_ORIGINS = new ArrayList<>();
    static {
        ALLOWED_ORIGINS.add("http://127.0.0.1:5500");
        ALLOWED_ORIGINS.add("http://localhost:5500");

        ALLOWED_ORIGINS.add("http://127.0.0.1:5555");
        ALLOWED_ORIGINS.add("http://localhost:5555");
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Primary
    @Bean
    CorsConfigurationSource configurationSource() {
        CorsConfiguration cors = new CorsConfiguration();
        cors.addAllowedHeader("*");
        cors.addAllowedMethod("*");
        cors.setAllowCredentials(true);
        cors.setAllowedOrigins(ALLOWED_ORIGINS);
        cors.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);

        return source;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/**")
                .addResourceLocations("classpath:/static/images/")
                .setCachePeriod(3600);
    }
}