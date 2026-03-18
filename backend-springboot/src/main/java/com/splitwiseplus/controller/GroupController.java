package com.splitwiseplus.controller;

import com.splitwiseplus.model.Group;
import com.splitwiseplus.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.bson.types.ObjectId;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/groups")
@CrossOrigin(origins = "*")
public class GroupController {
    @Autowired
    private GroupRepository groupRepository;

    @PostMapping("/create")
    public Group createGroup(@RequestBody Group group) {
        if (group.getMembers() == null) {
            group.setMembers(new ArrayList<>());
        }
        return groupRepository.save(group);
    }

    @GetMapping("/{userId}")
    public List<Group> getGroupsByUser(@PathVariable String userId) {
        return groupRepository.findByCreatedBy(new ObjectId(userId));
    }

    @GetMapping("/single/{id}")
    public Group getGroupById(@PathVariable String id) {
        return groupRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}/add-member")
    public Group addMember(@PathVariable String id, @RequestBody java.util.Map<String, String> request) {
        Group group = groupRepository.findById(id).orElse(null);
        if (group != null) {
            if (group.getMembers() == null) {
                group.setMembers(new ArrayList<>());
            }
            String memberName = request.get("memberName");
            if (memberName != null && !group.getMembers().contains(memberName)) {
                group.getMembers().add(memberName);
            }
            return groupRepository.save(group);
        }
        return null;
    }

    @PutMapping("/{id}/remove-member")
    public Group removeMember(@PathVariable String id, @RequestBody java.util.Map<String, String> request) {
        Group group = groupRepository.findById(id).orElse(null);
        if (group != null && group.getMembers() != null) {
            group.getMembers().remove(request.get("memberName"));
            return groupRepository.save(group);
        }
        return null;
    }

    @DeleteMapping("/{id}")
    public void deleteGroup(@PathVariable String id) {
        groupRepository.deleteById(id);
    }
}
