package com.ada.ratemycourse.service.impls;

import com.ada.ratemycourse.dto.ProfessorResponse;
import com.ada.ratemycourse.model.Professor;
import com.ada.ratemycourse.repository.ProfessorRepository;
import com.ada.ratemycourse.service.ProfessorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProfessorServiceImpl implements ProfessorService {

    private final ProfessorRepository professorRepository;

    @Override
    public List<ProfessorResponse> getAll() {
        return professorRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public ProfessorResponse getById(Long id) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Professor not found"));

        return mapToResponse(professor);
    }

    private ProfessorResponse mapToResponse(Professor p) {
        return ProfessorResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .averageRating(p.getAverageRating())
                .reviewCount(p.getReviewCount())
                .build();
    }
}
}
