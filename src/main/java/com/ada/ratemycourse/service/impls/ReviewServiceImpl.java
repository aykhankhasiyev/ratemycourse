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

    public List<ReviewResponse> getReviewsForCourse(Long courseId, String currentUserEmail) {
        return reviewRepository.findByCourseId(courseId).stream()
                .map(review -> mapToResponse(review, currentUserEmail))
                .collect(Collectors.toList());
    }

    public List<ReviewResponse> getReviewsForProfessor(Long professorId, String currentUserEmail) {
        return reviewRepository.findByProfessorId(professorId).stream()
                .map(review -> mapToResponse(review, currentUserEmail))
                .collect(Collectors.toList());
    }

    public ReviewResponse updateReview(Long reviewId, ReviewRequest request, User currentUser) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only edit your own reviews");
        }

        review.setRating(request.getRating());
        review.setDifficulty(request.getDifficulty());
        review.setText(request.getText());
        review.setSemester(request.getSemester());
        review.setYear(request.getYear());

        review = reviewRepository.save(review);
        return mapToResponse(review, currentUser.getEmail());
    }

    public void deleteReview(Long reviewId, User currentUser) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only delete your own reviews");
        }

        reviewRepository.delete(review);
    }

    public String calculateDifficulty(List<Review> reviews) {
        if (reviews.isEmpty()) return null;

        int score = 0;
        for (Review review : reviews) {
            switch (review.getDifficulty()) {
                case "Easy": score += 3; break;
                case "Moderate": score += 1; break;
                case "Hard": score += 0; break;
            }
        }

        double avg = (double) score / reviews.size();
        if (avg >= 2) return "Easy";
        if (avg >= 0.5) return "Moderate";
        return "Hard";
    }

    private ReviewResponse mapToResponse(Review review, String currentUserEmail) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setRating(review.getRating());
        response.setDifficulty(review.getDifficulty());
        response.setText(review.getText());
        response.setSemester(review.getSemester());
        response.setYear(review.getYear());
        response.setCreatedAt(review.getCreatedAt());

        if (review.getCourse() != null) {
            response.setCourseCode(review.getCourse().getCode());
            response.setCourseTitle(review.getCourse().getTitle());
        }

        if (review.getProfessor() != null) {
            response.setProfessorName(review.getProfessor().getName());
        }

        response.setCanEdit(review.getUser().getEmail().equals(currentUserEmail));

        return response;
    }
}