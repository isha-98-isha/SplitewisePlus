package com.splitwiseplus.controller;

import com.splitwiseplus.model.Expense;
import com.splitwiseplus.model.User;
import com.splitwiseplus.model.Notification;
import com.splitwiseplus.model.Settlement;
import com.splitwiseplus.repository.ExpenseRepository;
import com.splitwiseplus.repository.UserRepository;
import com.splitwiseplus.repository.NotificationRepository;
import com.splitwiseplus.repository.SettlementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.bson.types.ObjectId;
import java.util.List;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin(origins = "*") // Allow React to connect
@SuppressWarnings("null")
public class ExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SettlementRepository settlementRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/add")
    public Expense createExpense(@RequestBody Expense expense) {
        Expense savedExpense = expenseRepository.save(expense);

        // Notify split members
        if (savedExpense.getSplitWith() != null && !savedExpense.getSplitWith().isEmpty()) {
            User payer = null;
            if (savedExpense.getUserId() != null) {
                payer = userRepository.findById(savedExpense.getUserId().toString()).orElse(null);
            }
            String payerName = payer != null ? payer.getName() : savedExpense.getPaidBy();

            for (Expense.SplitMember item : savedExpense.getSplitWith()) {
                if (item.getEmail() == null || item.getEmail().isEmpty()) continue;

                userRepository.findByEmail(item.getEmail()).ifPresent(targetUser -> {
                    // Don't notify the payer themselves
                    if (savedExpense.getUserId() == null || !targetUser.getId().equals(savedExpense.getUserId().toString())) {
                        Notification notification = new Notification();
                        notification.setRecipientId(new ObjectId(targetUser.getId()));
                        notification.setSenderId(savedExpense.getUserId());
                        notification.setType("expense_added");
                        notification.setMessage(String.format("%s added a new expense: \"%s\". You owe ₹%.2f.", 
                            payerName, savedExpense.getTitle(), item.getAmount()));
                        notification.setExpenseId(new ObjectId(savedExpense.getId()));
                        Notification savedNotification = notificationRepository.save(notification);

                        // Broadcast in real-time over WebSocket!
                        try {
                            messagingTemplate.convertAndSend("/topic/notifications/" + targetUser.getId(), savedNotification);
                        } catch (Exception ex) {
                            System.err.println("WebSocket broadcast error: " + ex.getMessage());
                        }
                    }
                });
            }
        }

        return savedExpense;
    }

    @GetMapping("/{userId}")
    public List<Expense> getExpensesByUser(@PathVariable String userId) {
        ObjectId userObjectId = new ObjectId(userId);
        User user = userRepository.findById(userId).orElse(null);
        String email = user != null ? user.getEmail() : "___no_email___";
        String name = user != null ? user.getName() : "___no_name___";
        
        return expenseRepository.findByUserIdOrEmailOrName(userObjectId, email, name);
    }

    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable String id) {
        expenseRepository.deleteById(id);
    }

    @GetMapping("/detail/{id}")
    public Expense getExpenseById(@PathVariable String id) {
        return expenseRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Expense updateExpense(@PathVariable String id, @RequestBody Expense expense) {
        expense.setId(id);
        return expenseRepository.save(expense);
    }

    @GetMapping("/settle/{userId}")
    public List<Settlement> getSettlements(@PathVariable String userId) {
        ObjectId userObjectId = new ObjectId(userId);
        User user = userRepository.findById(userId).orElse(null);
        String name = user != null ? user.getName() : "___no_name___";
        
        return settlementRepository.findByUserIdOrPersonName(userObjectId, name);
    }

    @PostMapping("/settle")
    public Settlement createSettlement(@RequestBody Settlement settlement) {
        Settlement savedSettlement = settlementRepository.save(settlement);

        // Notify the original payer that someone settled
        if (savedSettlement.getExpenseId() != null) {
            expenseRepository.findById(savedSettlement.getExpenseId().toString()).ifPresent(expense -> {
                User settler = null;
                if (savedSettlement.getUserId() != null) {
                    settler = userRepository.findById(savedSettlement.getUserId().toString()).orElse(null);
                }
                String settlerName = settler != null ? settler.getName() : savedSettlement.getPersonName();

                Notification notification = new Notification();
                notification.setRecipientId(expense.getUserId());
                notification.setSenderId(savedSettlement.getUserId());
                notification.setType("expense_settled");
                notification.setMessage(String.format("%s marked an expense as settled: \"%s\" (₹%.2f).", 
                    settlerName, expense.getTitle(), savedSettlement.getAmount()));
                notification.setExpenseId(new ObjectId(expense.getId()));
                
                Notification savedNotification = notificationRepository.save(notification);

                // Broadcast in real-time over WebSocket!
                try {
                    if (expense.getUserId() != null) {
                        messagingTemplate.convertAndSend("/topic/notifications/" + expense.getUserId().toString(), savedNotification);
                    }
                } catch (Exception ex) {
                    System.err.println("WebSocket broadcast error: " + ex.getMessage());
                }
            });
        }

        return savedSettlement;
    }

    @DeleteMapping("/settle/delete/{id}")
    public void deleteSettlement(@PathVariable String id) {
        settlementRepository.deleteById(id);
    }
}
