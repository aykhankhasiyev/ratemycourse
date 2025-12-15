package com.ada.ratemycourse.service.impls;


import com.ada.ratemycourse.dto.ReviewRequest;
import com.ada.ratemycourse.dto.ReviewResponse;
import com.ada.ratemycourse.model.Review;
import com.ada.ratemycourse.model.User;
import com.ada.ratemycourse.service.ReviewService;

import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class ReviewServiceImpl implements ReviewService {


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

    }
}