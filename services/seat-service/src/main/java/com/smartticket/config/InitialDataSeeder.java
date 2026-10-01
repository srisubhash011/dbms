package com.smartticket.config;

import com.smartticket.model.Event;
import com.smartticket.model.Seat;
import com.smartticket.model.User;
import com.smartticket.repository.EventRepository;
import com.smartticket.repository.SeatRepository;
import com.smartticket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Configuration
@RequiredArgsConstructor
public class InitialDataSeeder {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (userRepository.count() == 0) {
                userRepository.save(User.builder()
                        .name("System Admin")
                        .email("admin@smartticket.com")
                        .password(passwordEncoder.encode("admin123"))
                        .role(User.Role.ROLE_ADMIN)
                        .build());

                userRepository.save(User.builder()
                        .name("Demo User")
                        .email("user@smartticket.com")
                        .password(passwordEncoder.encode("user123"))
                        .role(User.Role.ROLE_USER)
                        .build());
            }

            if (eventRepository.count() == 0) {
                Event e1 = eventRepository.save(Event.builder()
                        .title("Avengers: Secret Wars Premiere")
                        .venue("Grand IMAX Theater - Screen 1")
                        .date(LocalDate.now().plusDays(2))
                        .time(LocalTime.of(19, 0))
                        .totalSeats(40)
                        .availableSeats(40)
                        .price(new BigDecimal("22.50"))
                        .description("Experience the ultimate marvel showdown in high frame rate 3D IMAX.")
                        .build());
                seedSeats(e1);

                Event e2 = eventRepository.save(Event.builder()
                        .title("Coldplay Music Of The Spheres Tour")
                        .venue("MetLife Stadium - NYC")
                        .date(LocalDate.now().plusDays(10))
                        .time(LocalTime.of(20, 30))
                        .totalSeats(50)
                        .availableSeats(50)
                        .price(new BigDecimal("150.00"))
                        .description("Live worldwide tour with spectacular laser shows and immersive LED wristbands.")
                        .build());
                seedSeats(e2);

                Event e3 = eventRepository.save(Event.builder()
                        .title("TechCon 2026: AI & High Concurrency")
                        .venue("Convention Center Hall A")
                        .date(LocalDate.now().plusDays(15))
                        .time(LocalTime.of(9, 0))
                        .totalSeats(30)
                        .availableSeats(30)
                        .price(new BigDecimal("49.99"))
                        .description("Annual Developer Summit focusing on distributed systems and transactional OCC.")
                        .build());
                seedSeats(e3);
            }
        };
    }

    private void seedSeats(Event event) {
        List<Seat> seats = new ArrayList<>();
        char row = 'A';
        int col = 1;
        for (int i = 0; i < event.getTotalSeats(); i++) {
            seats.add(Seat.builder()
                    .event(event)
                    .seatNumber("" + row + (col < 10 ? "0" + col : col))
                    .status(Seat.SeatStatus.AVAILABLE)
                    .build());
            col++;
            if (col > 10) {
                col = 1;
                row++;
            }
        }
        seatRepository.saveAll(seats);
    }
}
