package com.smartticket.notification.service;

import com.smartticket.notification.dto.BookingEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
public class NotificationConsumerService {

    private static final Logger log = LoggerFactory.getLogger(NotificationConsumerService.class);

    @RabbitListener(queues = "${rabbitmq.queue:notification.queue}")
    public void consumeBookingEvent(BookingEvent event) {
        log.info("==================================================================");
        log.info("📢 [NOTIFICATION SERVICE] Asynchronous Event Received from RabbitMQ!");
        log.info("   Notification processed: Booking {} confirmed for Seat {}", event.getBookingId(), event.getSeatNumber());
        log.info("   Transaction ID : {}", event.getTransactionId());
        log.info("   User Email     : {}", event.getUserEmail() != null ? event.getUserEmail() : "user@smartticket.com");
        log.info("   Event Title    : {}", event.getEventTitle());
        log.info("   Ticket Price   : ${}", event.getPrice());
        log.info("   Processed By   : {}", event.getProcessedByInstance());
        log.info("==================================================================");
    }
}
