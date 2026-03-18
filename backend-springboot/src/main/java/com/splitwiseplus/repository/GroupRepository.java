package com.splitwiseplus.repository;

import com.splitwiseplus.model.Group;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.bson.types.ObjectId;
import java.util.List;

public interface GroupRepository extends MongoRepository<Group, String> {
    List<Group> findByCreatedBy(ObjectId createdBy);
}
