package com.ada.ratemycourse.repository;

import com.ada.ratemycourse.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByCode(String code);
    List<Course> findBySchool(String school);
    List<Course> findByProfessorId(Long professorId);

    @Query("SELECT c FROM Course c WHERE " +
            "LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.code) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(c.professor.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Course> searchCourses(String query);
}