package com.splitwiseplus.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Handles both $2a$ (Spring BCrypt) and $2b$ (Node.js bcryptjs) hash formats
        return new org.springframework.security.crypto.password.PasswordEncoder() {
            private final BCryptPasswordEncoder delegate = new BCryptPasswordEncoder();

            @Override
            public String encode(CharSequence rawPassword) {
                return delegate.encode(rawPassword);
            }

            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {
                if (encodedPassword == null) return false;
                // Normalize $2b$ prefix (Node.js bcryptjs) to $2a$ (Spring BCrypt)
                String normalized = encodedPassword.startsWith("$2b$")
                        ? "$2a$" + encodedPassword.substring(4)
                        : encodedPassword;
                return delegate.matches(rawPassword, normalized);
            }
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors().and().csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS).and()
            .authorizeRequests()
            .antMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
            .antMatchers("/api/users/login", "/api/users/register", "/api/users/forgot-password", "/api/users/reset-password").permitAll()
            .antMatchers("/api/expenses/**", "/api/groups/**", "/api/notifications/**", "/api/settlements/**", "/api/admin/**").permitAll()
            .antMatchers("/api/test/**").permitAll()
            .anyRequest().authenticated();

        return http.build();
    }

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        // Allow localhost for dev + any Render/production URL
        config.addAllowedOriginPattern("http://localhost:*");
        config.addAllowedOriginPattern("https://*.onrender.com");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
