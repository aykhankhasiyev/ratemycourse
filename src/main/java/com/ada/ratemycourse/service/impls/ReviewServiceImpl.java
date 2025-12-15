package com.ada.ratemycourse.service.impls;

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

@Service
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private ProfessorRepository professorRepository;

    @Override
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
    }

    @Override
    public List<ReviewResponse> getReviewsForCourse(Long courseId, String email) {
        return reviewRepository.findByCourseId(courseId)
                .stream()
                .map(review -> mapToResponse(review, email))
                .collect(Collectors.toList());
    }

    @Override
    public List<ReviewResponse> getReviewsForProfessor(Long professorId, String email) {
        return reviewRepository.findByProfessorId(professorId)
                .stream()
                .map(review -> mapToResponse(review, email))
                .collect(Collectors.toList());
    }

    @Override
    public ReviewResponse updateReview(Long reviewId, ReviewRequest request, User currentUser) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only update your own reviews");
        }

        review.setRating(request.getRating());
        review.setDifficulty(request.getDifficulty());
        review.setText(request.getText());
        review.setSemester(request.getSemester());
        review.setYear(request.getYear());

        review = reviewRepository.save(review);
        return mapToResponse(review, currentUser.getEmail());
    }

    @Override
    public void deleteReview(Long reviewId, User currentUser) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
    }

    @Override
    public String calculateDifficulty(List<Review> reviews) {
        if (reviews.isEmpty()) return "Unknown";

        long hard = reviews.stream().filter(r -> "Hard".equals(r.getDifficulty())).count();
        long moderate = reviews.stream().filter(r -> "Moderate".equals(r.getDifficulty())).count();
        long easy = reviews.stream().filter(r -> "Easy".equals(r.getDifficulty())).count();

        if (hard >= moderate && hard >= easy) return "Hard";
        if (moderate >= easy) return "Moderate";
        return "Easy";
    }
}