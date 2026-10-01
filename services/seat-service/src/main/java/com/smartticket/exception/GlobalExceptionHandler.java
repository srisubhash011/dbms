package com.smartticket.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @Data
    @AllArgsConstructor
    public static class ErrorResponse {
        private int status;
        private String message;
        private LocalDateTime timestamp;
    }

    @ExceptionHandler(SeatAlreadyBookedException.class)
    public ResponseEntity<ErrorResponse> handleSeatAlreadyBooked(SeatAlreadyBookedException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(HttpStatus.CONFLICT.value(), ex.getMessage(), LocalDateTime.now()));
    }

    @ExceptionHandler(TimeoutException.class)
    public ResponseEntity<ErrorResponse> handleTimeout(TimeoutException ex) {
        return ResponseEntity.status(HttpStatus.REQUEST_TIMEOUT)
                .body(new ErrorResponse(HttpStatus.REQUEST_TIMEOUT.value(), ex.getMessage(), LocalDateTime.now()));
    }

    @ExceptionHandler(BookingException.class)
    public ResponseEntity<ErrorResponse> handleBookingException(BookingException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse(HttpStatus.BAD_REQUEST.value(), ex.getMessage(), LocalDateTime.now()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), ex.getMessage(), LocalDateTime.now()));
    }
}
