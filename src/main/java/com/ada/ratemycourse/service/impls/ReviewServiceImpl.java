package com.ada.ratemycourse.service.impls;

<<<<<<< HEAD

import com.ada.ratemycourse.dto.ReviewRequest;
import com.ada.ratemycourse.dto.ReviewResponse;
import com.ada.ratemycourse.model.Review;
import com.ada.ratemycourse.model.User;
import com.ada.ratemycourse.service.ReviewService;

import org.springframework.stereotype.Service;

import java.util.List;

=======
import com.ada.ratemycourse.dto.ReviewRequest;
import com.ada.ratemycourse.dto.ReviewResponse;
import com.ada.ratemycourse.model.Course;
import com.ada.ratemycourse.model.Professor;
import com.ada.ratemycourse.model.Review;
import com.ada.ratemycourse.model.User;
import com.ada.ratemycourse.repository.CourseRepository;
import com.ada.ratemycourse.repository.ProfessorRepository;
import com.ada.ratemycourse.repository.ReviewRepository;
import com.ada.ratemycourse.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
>>>>>>> 635efe3 (feat: add ReviewService implementation for creating course/professor reviews)

@Service
public class ReviewServiceImpl implements ReviewService {

<<<<<<< HEAD

    @Override
    public String calculateDifficulty(List<Review> reviews) {
        return "";
    }

    @Override
    public ReviewResponse createReview(ReviewRequest reviewRequest, User currentUser) {
        return null;
    }

    @Override
    public List<ReviewResponse> getReviewsForCourse(Long courseId, String email) {
        return List.of();
    }

    @Override
    public List<ReviewResponse> getReviewsForProfessor(Long professorId, String email) {
        return List.of();
    }

    @Override
    public ReviewResponse updateReview(Long reviewId, ReviewRequest reviewRequest, User currentUser) {
        return null;
    }

    @Override
    public void deleteReview(Long reviewId, User currentUser) {

=======
    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    public ReviewResponse createReview(ReviewRequest request, User currentUser) {
        Review review = new Review();
        review.setUser(currentUser);
        review.setRating(request.getRating());
        review.setDifficulty(request.getDifficulty());
        review.setText(request.getText());
        review.setSemester(request.getSemester());
        review.setYear(request.getYear());

        if (request.getCourseId() != null) {
            Course course = courseRepository.findById(request.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Course not found"));
            review.setCourse(course);
        }

        if (request.getProfessorId() != null) {
            Professor professor = professorRepository.findById(request.getProfessorId())
                    .orElseThrow(() -> new RuntimeException("Professor not found"));
            review.setProfessor(professor);
        }

        review = reviewRepository.save(review);
        return mapToResponse(review, currentUser.getEmail());
>>>>>>> 635efe3 (feat: add ReviewService implementation for creating course/professor reviews)
    }
}