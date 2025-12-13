package com.ada.ratemycourse.controller;


import com.ada.ratemycourse.dto.ProfessorResponse;
import com.ada.ratemycourse.service.ProfessorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/professors")
@RequiredArgsConstructor
public class ProfessorController {

    private final ProfessorService professorService;

    // ✅ Get all professors
    @GetMapping
    public ResponseEntity<List<ProfessorResponse>> getAll() {
        return ResponseEntity.ok(professorService.getAll());
    }

    // ✅ Get professor by id
    @GetMapping("/{id}")
    public ResponseEntity<ProfessorResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(professorService.getById(id));
    }
}
