package com.ada.ratemycourse.service;

import com.ada.ratemycourse.dto.ProfessorResponse;
import org.jspecify.annotations.Nullable;

import java.util.List;

public interface ProfessorService {
    @Nullable List<ProfessorResponse> getAllProfessors();

    @Nullable ProfessorResponse getProfessorByName(String name);

    @Nullable ProfessorResponse getProfessorById(Long id);

    @Nullable List<ProfessorResponse> searchProfessors(String query);

    @Nullable List<ProfessorResponse> getProfessorsBySchool(String school);
}
