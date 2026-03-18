package com.splitwiseplus.controller;

import com.splitwiseplus.model.User;
import com.splitwiseplus.model.Expense;
import com.splitwiseplus.repository.UserRepository;
import com.splitwiseplus.repository.ExpenseRepository;
import com.splitwiseplus.repository.SettlementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AdminController.class);

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        logger.info("Fetching admin stats");
        Map<String, Object> stats = new HashMap<>();
        long totalUsers = userRepository.count();
        long totalExpenses = expenseRepository.count();
        
        List<Expense> allExpenses = expenseRepository.findAll();
        double totalVolume = allExpenses.stream().mapToDouble(e -> e.getAmount() != null ? e.getAmount() : 0.0).sum();
        
        long pendingSettlements = allExpenses.stream().filter(e -> e.getSplitWith() != null && !e.getSplitWith().isEmpty()).count();

        stats.put("totalUsers", totalUsers);
        stats.put("totalExpenses", totalExpenses);
        stats.put("totalVolume", totalVolume);
        stats.put("pendingSettlements", (int)pendingSettlements);
        
        return stats;
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        logger.info("Fetching all users for admin");
        return userRepository.findAll().stream().map(user -> {
            user.setPassword(null); // Safety
            return user;
        }).collect(Collectors.toList());
    }

    @DeleteMapping("/users/{id}")
    public Map<String, String> deleteUser(@PathVariable String id) {
        logger.info("Deleting user: {}", id);
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        if ("admin".equals(user.getRole())) {
            throw new RuntimeException("Cannot delete an admin");
        }
        
        userRepository.deleteById(id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "User and their data deleted successfully");
        return response;
    }

    @GetMapping("/expenses")
    public List<Map<String, Object>> getAllExpenses() {
        logger.info("Fetching all expenses for admin");
        List<Expense> expenses = expenseRepository.findAll();
        List<User> users = userRepository.findAll();
        Map<String, User> userMap = users.stream().collect(Collectors.toMap(u -> u.getId(), u -> u, (u1, u2) -> u1));

        return expenses.stream().map(exp -> {
            Map<String, Object> expMap = new java.util.LinkedHashMap<>();
            expMap.put("_id", exp.getId());
            expMap.put("title", exp.getTitle());
            expMap.put("amount", exp.getAmount());
            expMap.put("category", exp.getCategory());
            expMap.put("paidBy", exp.getPaidBy());
            expMap.put("createdAt", exp.getCreatedAt());
            expMap.put("notes", exp.getNotes());
            expMap.put("splitWith", exp.getSplitWith());
            expMap.put("totalSplit", exp.getTotalSplit());
            
            // Populate userId with a small object containing name/email to match frontend
            if (exp.getUserId() != null) {
                User user = userMap.get(exp.getUserId().toString());
                if (user != null) {
                    Map<String, String> userBrief = new HashMap<>();
                    userBrief.put("name", user.getName());
                    userBrief.put("email", user.getEmail());
                    expMap.put("userId", userBrief);
                } else {
                    expMap.put("userId", null);
                }
            } else {
                expMap.put("userId", null);
            }
            
            return expMap;
        }).collect(Collectors.toList());
    }
}
