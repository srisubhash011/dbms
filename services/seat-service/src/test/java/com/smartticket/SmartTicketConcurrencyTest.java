package com.smartticket;

import com.smartticket.dto.BookingRequest;
import com.smartticket.dto.BookingResponse;
import com.smartticket.dto.SimulationRequest;
import com.smartticket.dto.SimulationResponse;
import com.smartticket.model.Event;
import com.smartticket.repository.EventRepository;
import com.smartticket.services.BookingService;
import com.smartticket.simulation.SimulationService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = com.smartticket.cmd.Application.class)
class SmartTicketConcurrencyTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private SimulationService simulationService;

    @Autowired
    private EventRepository eventRepository;

    @Test
    void contextLoads() {
        assertNotNull(bookingService);
    }

    @Test
    void testConcurrentSimulationExecution() {
        Event event = eventRepository.findAll().stream().findFirst().orElseThrow();
        SimulationRequest request = new SimulationRequest();
        request.setThreadCount(50);
        request.setEventId(event.getId());
        request.setSimulateConflicts(true);

        SimulationResponse response = simulationService.runSimulation(request);

        assertNotNull(response);
        assertEquals(50, response.getTotalThreads());
        assertTrue(response.getSuccessfulBookings() + response.getFailedBookings() == 50);
    }
}
