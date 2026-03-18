package com.splitwiseplus.repository;

import com.splitwiseplus.model.Settlement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.bson.types.ObjectId;
import java.util.List;

public interface SettlementRepository extends MongoRepository<Settlement, String> {
    @Query("{ '$or': [ { 'userId': ?0 }, { 'personName': { '$regex': ?1, '$options': 'i' } } ] }")
    List<Settlement> findByUserIdOrPersonName(ObjectId userId, String personName);
}
