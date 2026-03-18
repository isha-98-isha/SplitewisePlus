package com.splitwiseplus.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import com.splitwiseplus.util.ObjectIdDeserializer;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.Date;
import java.util.List;

@Document(collection = "expenses")
@Data
public class Expense {
    @Id
    @JsonProperty("_id")
    private String id;
    
    private String title;
    private Double amount;
    private String category;
    private String paidBy;
    private String paidByEmail;
    
    @JsonSerialize(using = ToStringSerializer.class)
    @JsonDeserialize(using = ObjectIdDeserializer.class)
    private org.bson.types.ObjectId userId; // Reference to User ID
    
    private Date createdAt = new Date();
    private String notes = "";
    
    private List<SplitMember> splitWith;
    private Integer totalSplit = 1;
    
    @JsonSerialize(using = ToStringSerializer.class)
    @JsonDeserialize(using = ObjectIdDeserializer.class)
    private org.bson.types.ObjectId groupId;

    @Data
    public static class SplitMember {
        private String name;
        private String email;
        private Double amount;
    }
}
