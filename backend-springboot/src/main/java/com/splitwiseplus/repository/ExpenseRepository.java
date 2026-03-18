package com.splitwiseplus.repository;

import com.splitwiseplus.model.Expense;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.bson.types.ObjectId;
import java.util.List;

public interface ExpenseRepository extends MongoRepository<Expense, String> {
    @Query("{ '$or': [ { 'userId': ?0 }, { 'splitWith.email': ?1 }, { 'splitWith.name': ?2 } ] }")
    List<Expense> findByUserIdOrEmailOrName(ObjectId userId, String email, String name);
    
    List<Expense> findByGroupId(ObjectId groupId);
}
