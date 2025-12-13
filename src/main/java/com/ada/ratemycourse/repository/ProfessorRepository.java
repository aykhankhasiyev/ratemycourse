package com.ada.ratemycourse.repository;

import com.ada.ratemycourse.model.Professor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ProfessorRepository extends JpaRepository<Professor, Long> {
    Optional<Professor> findByName(String name);
    List<Professor> findBySchool(String school);

    @Query("SELECT p FROM Professor p WHERE " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Professor> searchProfessors(String query);
}
