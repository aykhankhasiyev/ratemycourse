package com.ada.ratemycourse.service;


import com.ada.ratemycourse.dto.ProfessorResponse;

import java.util.List;

public interface ProfessorService {

    List<ProfessorResponse> getAll();

    ProfessorResponse getById(Long id);
}
