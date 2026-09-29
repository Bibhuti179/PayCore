package com.paycore.security;

import com.paycore.entity.AccountStatus;
import com.paycore.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String customerId;
    private final String email;
    private final String password;
    private final AccountStatus status;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(Long id, String customerId, String email, String password, AccountStatus status,
                         Collection<? extends GrantedAuthority> authorities) {
        this.id = id;
        this.customerId = customerId;
        this.email = email;
        this.password = password;
        this.status = status;
        this.authorities = authorities;
    }

    public static UserPrincipal create(User user) {
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority(user.getRole().name()));
        return new UserPrincipal(
                user.getId(),
                user.getCustomerId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getStatus(),
                authorities
        );
    }

    public Long getId() { return id; }
    public String getCustomerId() { return customerId; }
    public String getEmail() { return email; }
    public AccountStatus getStatus() { return status; }

    @Override
    public String getUsername() {
        return customerId != null ? customerId : email;
    }

    @Override
    public String getPassword() { return password; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() {
        return status != AccountStatus.SUSPENDED;
    }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
