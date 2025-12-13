package com.ada.ratemycourse.repository;

import com.ada.ratemycourse.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByCourseId(Long courseId);
    List<Review> findByProfessorId(Long professorId);
    List<Review> findByUserId(Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.course.id = :courseId")
    Double getAverageRatingForCourse(Long courseId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.professor.id = :professorId")
    Double getAverageRatingForProfessor(Long professorId);
}