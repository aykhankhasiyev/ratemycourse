package com.ada.ratemycourse.service.impls;

import com.ada.ratemycourse.dto.CourseResponse;
import com.ada.ratemycourse.model.Course;
import com.ada.ratemycourse.repository.CourseRepository;
import com.ada.ratemycourse.repository.ReviewRepository;
import com.ada.ratemycourse.service.CourseService;
import com.ada.ratemycourse.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ReviewService reviewService;

    public List<CourseResponse> getAllCourses() {
        return courseRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CourseResponse getCourseByCode(String code) {
        Course course = courseRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Course not found"));
        return mapToResponse(course);
    }

    public List<CourseResponse> searchCourses(String query) {
        return courseRepository.searchCourses(query).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CourseResponse> getCoursesBySchool(String school) {
        return courseRepository.findBySchool(school).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private CourseResponse mapToResponse(Course course) {
        CourseResponse response = new CourseResponse();
        response.setId(course.getId());
        response.setCode(course.getCode());
        response.setTitle(course.getTitle());
        response.setSchool(course.getSchool());
        response.setDepartment(course.getDepartment());
        response.setProfessorName(course.getProfessor().getName());
        response.setProfessorId(course.getProfessor().getId());

        // Calculate average rating
        Double avgRating = reviewRepository.getAverageRatingForCourse(course.getId());
        response.setAverageRating(avgRating);

        // Get review count
        int reviewCount = course.getReviews().size();
        response.setReviewCount(reviewCount);

        // Calculate difficulty
        String difficulty = reviewService.calculateDifficulty(course.getReviews());
        response.setDifficulty(difficulty);

        return response;
    }
}