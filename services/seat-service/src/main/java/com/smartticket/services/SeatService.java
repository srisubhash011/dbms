package com.smartticket.services;

import com.smartticket.dto.SeatDto;
import com.smartticket.dto.SeatReservationRequest;
import com.smartticket.dto.SeatReservationResponse;
import com.smartticket.repository.SeatDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatDataRepository seatDataRepository;

    public List<SeatDto> getSeatsByEventId(Long eventId) {
        return seatDataRepository.findSeatsByEventId(eventId);
    }

    public SeatReservationResponse reserveSeat(SeatReservationRequest request) {
        return seatDataRepository.reserveSeatAtomically(request);
    }

    public String getCacheMetrics() {
        return seatDataRepository.getCacheMetrics();
    }
}
