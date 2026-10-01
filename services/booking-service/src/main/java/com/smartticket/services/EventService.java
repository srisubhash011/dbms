package com.smartticket.services;

import com.smartticket.dto.EventResponse;
import com.smartticket.model.Event;
import com.smartticket.model.Seat;
import com.smartticket.repository.EventRepository;
import com.smartticket.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;

    @Transactional
    public Event createEvent(Event event) {
        if (event.getAvailableSeats() == null) {
            event.setAvailableSeats(event.getTotalSeats());
        }
        Event savedEvent = eventRepository.save(event);

        // Auto-generate seats for grid layout (Rows A-E, Numbers 1-10 depending on totalSeats)
        int total = event.getTotalSeats();
        List<Seat> seats = new ArrayList<>();
        char row = 'A';
        int col = 1;

        for (int i = 0; i < total; i++) {
            String seatNum = "" + row + (col < 10 ? "0" + col : col);
            seats.add(Seat.builder()
                    .event(savedEvent)
                    .seatNumber(seatNum)
                    .status(Seat.SeatStatus.AVAILABLE)
                    .build());

            col++;
            if (col > 10) {
                col = 1;
                row++;
            }
        }
        seatRepository.saveAll(seats);

        return savedEvent;
    }

    public List<EventResponse> getAllEvents() {
        return eventRepository.findAllByOrderByDateAsc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));
        return mapToResponse(event);
    }

    @Transactional
    public Event updateEvent(Long id, Event updated) {
        Event existing = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found with ID: " + id));
        
        existing.setTitle(updated.getTitle());
        existing.setVenue(updated.getVenue());
        existing.setDate(updated.getDate());
        existing.setTime(updated.getTime());
        existing.setPrice(updated.getPrice());
        existing.setDescription(updated.getDescription());

        return eventRepository.save(existing);
    }

    @Transactional
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    private EventResponse mapToResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .venue(event.getVenue())
                .date(event.getDate())
                .time(event.getTime())
                .totalSeats(event.getTotalSeats())
                .availableSeats(event.getAvailableSeats())
                .price(event.getPrice())
                .description(event.getDescription())
                .build();
    }
}
