package com.smartticket.services;

import com.smartticket.dto.SeatDto;
import com.smartticket.model.Seat;
import com.smartticket.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;

    public List<SeatDto> getSeatsByEventId(Long eventId) {
        return seatRepository.findByEventIdOrderBySeatNumberAsc(eventId).stream()
                .map(seat -> SeatDto.builder()
                        .id(seat.getId())
                        .eventId(seat.getEvent().getId())
                        .seatNumber(seat.getSeatNumber())
                        .status(seat.getStatus().name())
                        .version(seat.getVersion())
                        .build())
                .collect(Collectors.toList());
    }
}
