package com.ada.ratemycourse.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // IMPORTANT: Allow credentials
        config.setAllowCredentials(true);

        // Set allowed origins (must be exact, cannot use * with credentials)
        config.setAllowedOriginPatterns(Arrays.asList(
                "http://localhost:*",
                "http://127.0.0.1:*"
        ));

        // Allow all headers
        config.setAllowedHeaders(Arrays.asList("*"));

        // Allow all methods
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Expose headers
        config.setExposedHeaders(Arrays.asList("Authorization", "Set-Cookie"));

        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}