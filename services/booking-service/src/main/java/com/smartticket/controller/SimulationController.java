package com.smartticket.controller;

import com.smartticket.dto.SimulationRequest;
import com.smartticket.dto.SimulationResponse;
import com.smartticket.simulation.SimulationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/simulation")
@RequiredArgsConstructor
public class SimulationController {

    private final SimulationService simulationService;

    @PostMapping("/run")
    public ResponseEntity<SimulationResponse> runSimulation(@RequestBody SimulationRequest request) {
        return ResponseEntity.ok(simulationService.runSimulation(request));
    }
}
