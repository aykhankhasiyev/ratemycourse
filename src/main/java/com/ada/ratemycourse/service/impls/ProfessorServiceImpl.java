package com.ada.ratemycourse.service.impls;

import com.ada.ratemycourse.dto.CourseResponse;
import com.ada.ratemycourse.dto.ProfessorResponse;
import com.ada.ratemycourse.model.Course;
import com.ada.ratemycourse.model.Professor;
import com.ada.ratemycourse.model.Review;
import com.ada.ratemycourse.repository.ProfessorRepository;
import com.ada.ratemycourse.repository.ReviewRepository;
import com.ada.ratemycourse.service.ProfessorService;
import com.ada.ratemycourse.service.ReviewService;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfessorServiceImpl implements ProfessorService {


    @Override
    public @Nullable List<ProfessorResponse> getAllProfessors() {
        return List.of();
    }

    @Override
    public @Nullable ProfessorResponse getProfessorByName(String name) {
        return null;
    }

    @Override
    public @Nullable ProfessorResponse getProfessorById(Long id) {
        return null;
    }

    @Override
    public @Nullable List<ProfessorResponse> searchProfessors(String query) {
        return List.of();
    }

    @Override
    public @Nullable List<ProfessorResponse> getProfessorsBySchool(String school) {
        return List.of();
    }
}
