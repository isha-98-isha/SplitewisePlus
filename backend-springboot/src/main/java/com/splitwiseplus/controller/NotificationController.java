package com.splitwiseplus.controller;

import com.splitwiseplus.model.Notification;
import com.splitwiseplus.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.bson.types.ObjectId;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {
    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping("/{userId}")
    public List<Notification> getNotificationsByUserId(@PathVariable String userId) {
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(new ObjectId(userId));
    }

    @PutMapping("/read/{id}")
    public Notification markAsRead(@PathVariable String id) {
        Notification notification = notificationRepository.findById(id).orElse(null);
        if (notification != null) {
            notification.setIsRead(true);
            return notificationRepository.save(notification);
        }
        return null;
    }

    @DeleteMapping("/clear/{userId}")
    public void clearNotifications(@PathVariable String userId) {
        List<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(new ObjectId(userId));
        notificationRepository.deleteAll(notifications);
    }
}
