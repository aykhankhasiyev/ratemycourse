package com.ada.ratemycourse.controller;

import com.ada.ratemycourse.dto.ProfessorResponse;
import com.ada.ratemycourse.service.ProfessorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/professors")
public class ProfessorController {

    @Autowired
    private ProfessorService professorService;

    @GetMapping
    public ResponseEntity<List<ProfessorResponse>> getAllProfessors() {
        return ResponseEntity.ok(professorService.getAllProfessors());
    }

    @GetMapping("/{name}")
    public ResponseEntity<ProfessorResponse> getProfessorByName(@PathVariable String name) {
        return ResponseEntity.ok(professorService.getProfessorByName(name));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<ProfessorResponse> getProfessorById(@PathVariable Long id) {
        return ResponseEntity.ok(professorService.getProfessorById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProfessorResponse>> searchProfessors(@RequestParam String query) {
        return ResponseEntity.ok(professorService.searchProfessors(query));
    }

    @GetMapping("/school/{school}")
    public ResponseEntity<List<ProfessorResponse>> getProfessorsBySchool(@PathVariable String school) {
        return ResponseEntity.ok(professorService.getProfessorsBySchool(school));
    }
}
