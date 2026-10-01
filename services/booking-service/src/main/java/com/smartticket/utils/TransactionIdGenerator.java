package com.smartticket.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;
import java.util.UUID;

public class TransactionIdGenerator {

    private static final Random RANDOM = new Random();

    public static String generateTransactionId() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String uuidPart = UUID.randomUUID().toString().substring(0, 5).toUpperCase();
        int randomPart = 100 + RANDOM.nextInt(900);
        return String.format("TXN-%s-%s%d", datePart, uuidPart, randomPart);
    }
}
