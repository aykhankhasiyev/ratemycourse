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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProfessorServiceImpl implements ProfessorService {

    @Autowired
    private ProfessorRepository professorRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReviewService reviewService;

    public List<ProfessorResponse> getAllProfessors() {
        return professorRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public ProfessorResponse getProfessorByName(String name) {
        Professor professor = professorRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Professor not found"));
        return mapToResponseWithCourses(professor);
    }

    public ProfessorResponse getProfessorById(Long id) {
        Professor professor = professorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Professor not found"));
        return mapToResponseWithCourses(professor);
    }

    public List<ProfessorResponse> searchProfessors(String query) {
        return professorRepository.searchProfessors(query).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<ProfessorResponse> getProfessorsBySchool(String school) {
        return professorRepository.findBySchool(school).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ProfessorResponse mapToResponse(Professor professor) {
        ProfessorResponse response = new ProfessorResponse();
        response.setId(professor.getId());
        response.setName(professor.getName());
        response.setSchool(professor.getSchool());
        response.setDepartment(professor.getDepartment());
        response.setCoursesCount(professor.getCourses().size());

        // Get all reviews for this professor (from all their courses + direct professor reviews)
        List<Review> allReviews = new ArrayList<>();

        // Add direct professor reviews
        allReviews.addAll(professor.getReviews());

        // Add reviews from all courses taught by this professor
        for (Course course : professor.getCourses()) {
            allReviews.addAll(course.getReviews());
        }

        // Calculate average rating
        if (!allReviews.isEmpty()) {
            Double avgRating = allReviews.stream()
                    .mapToDouble(Review::getRating)
                    .average()
                    .orElse(0.0);
            response.setAverageRating(avgRating);
        }

        response.setReviewCount(allReviews.size());

        // Calculate difficulty
        String difficulty = reviewService.calculateDifficulty(allReviews);
        response.setDifficulty(difficulty);

        return response;
    }

    private ProfessorResponse mapToResponseWithCourses(Professor professor) {
        ProfessorResponse response = mapToResponse(professor);

        // Add courses
        List<CourseResponse> courses = professor.getCourses().stream()
                .map(this::mapCourseToResponse)
                .collect(Collectors.toList());
        response.setCourses(courses);

        return response;
    }

    private CourseResponse mapCourseToResponse(Course course) {
        CourseResponse response = new CourseResponse();
        response.setId(course.getId());
        response.setCode(course.getCode());
        response.setTitle(course.getTitle());
        response.setSchool(course.getSchool());
        response.setDepartment(course.getDepartment());
        response.setProfessorName(course.getProfessor().getName());
        response.setProfessorId(course.getProfessor().getId());

        // Calculate average rating for this course
        List<Review> reviews = course.getReviews();
        if (!reviews.isEmpty()) {
            Double avgRating = reviews.stream()
                    .mapToDouble(Review::getRating)
                    .average()
                    .orElse(0.0);
            response.setAverageRating(avgRating);
        }

        response.setReviewCount(reviews.size());

        // Calculate difficulty
        String difficulty = reviewService.calculateDifficulty(reviews);
        response.setDifficulty(difficulty);

        return response;
    }
}
