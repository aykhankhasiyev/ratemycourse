package com.ada.ratemycourse.service;

import com.ada.ratemycourse.dto.ReviewRequest;
import com.ada.ratemycourse.dto.ReviewResponse;
import com.ada.ratemycourse.model.Review;
import com.ada.ratemycourse.model.User;
import jakarta.validation.Valid;

import java.util.List;

public interface ReviewService {
    String calculateDifficulty(List<Review> reviews);

    ReviewResponse createReview(@Valid ReviewRequest reviewRequest, User currentUser);

    List<ReviewResponse> getReviewsForCourse(Long courseId, String email);

    List<ReviewResponse> getReviewsForProfessor(Long professorId, String email);

    ReviewResponse updateReview(Long reviewId, @Valid ReviewRequest reviewRequest, User currentUser);

    void deleteReview(Long reviewId, User currentUser);
}
