package com.splitwiseplus.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;

@Document(collection = "users")
@Data
public class User {
    @Id
    @JsonProperty("_id")
    private String id;
    
    private String name;
    
    @Indexed(unique = true)
    private String email;
    
    private String password;
    
    private String role = "user"; // Default role
    
    private String resetPasswordToken;
    private Date resetPasswordExpire;
}
