package com.orb.service;

import com.orb.entity.Notification;
import com.orb.entity.User;
import com.orb.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    /**
     * Creates an in-app notification and (optionally) sends an email
     * when a user receives a transfer.
     * Rule #7: @Async — never block the HTTP response thread.
     */
    @Async
    public void notifyTransfer(User receiver, String senderWalletTag, BigDecimal amount) {
        try {
            // Save in-app notification
            Notification notification = Notification.builder()
                    .user(receiver)
                    .type("TRANSFER")
                    .title("Money Received")
                    .message("You received " + amount.toPlainString() + " ORB from " + senderWalletTag)
                    .isRead(false)
                    .build();

            notificationRepository.save(notification);
            log.info("Notification saved for user [id={}]", receiver.getId());

            // TODO: Send email via Twilio SendGrid (Phase 5)
            // emailService.sendTransferNotification(receiver.getEmail(), senderWalletTag, amount);

        } catch (Exception ex) {
            // Never let notification failure propagate — transfer already committed
            log.error("Failed to send notification to user [id={}]: {}", receiver.getId(), ex.getMessage());
        }
    }

    /**
     * Fetches paginated notifications for a user.
     */
    public Page<Notification> getNotifications(UUID userId, int page, int size) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size));
    }

    /**
     * Returns count of unread notifications.
     */
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    /**
     * Marks a notification as read.
     */
    public void markAsRead(UUID notificationId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            n.setIsRead(true);
            notificationRepository.save(n);
        });
    }

    /**
     * Marks all notifications for a user as read.
     */
    public void markAllAsRead(UUID userId) {
        Page<Notification> unread = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 1000));
        unread.getContent().stream()
                .filter(n -> !n.getIsRead())
                .forEach(n -> {
                    n.setIsRead(true);
                    notificationRepository.save(n);
                });
    }
}
