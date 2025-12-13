package com.ada.ratemycourse.controller;

import com.ada.ratemycourse.dto.ReviewRequest;
import com.ada.ratemycourse.dto.ReviewResponse;
import com.ada.ratemycourse.model.User;
import com.ada.ratemycourse.service.AuthService;
import com.ada.ratemycourse.service.ReviewService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private AuthService authService;

    private String getUserEmailFromSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) {
            throw new RuntimeException("Not authenticated");
        }
        String email = (String) session.getAttribute("user_email");
        if (email == null) {
            throw new RuntimeException("Not authenticated");
        }
        return email;
    }

    @PostMapping
    public ResponseEntity<?> createReview(@Valid @RequestBody ReviewRequest reviewRequest,
                                          HttpServletRequest request) {
        try {
            String email = getUserEmailFromSession(request);
            User currentUser = authService.getUserByEmail(email);
            ReviewResponse response = reviewService.createReview(reviewRequest, currentUser);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsForCourse(
            @PathVariable Long courseId,
            HttpServletRequest request) {

        String email = null;
        HttpSession session = request.getSession(false);
        if (session != null) {
            email = (String) session.getAttribute("user_email");
        }

        List<ReviewResponse> reviews = reviewService.getReviewsForCourse(courseId, email);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/professor/{professorId}")
    public ResponseEntity<List<ReviewResponse>> getReviewsForProfessor(
            @PathVariable Long professorId,
            HttpServletRequest request) {

        String email = null;
        HttpSession session = request.getSession(false);
        if (session != null) {
            email = (String) session.getAttribute("user_email");
        }

        List<ReviewResponse> reviews = reviewService.getReviewsForProfessor(professorId, email);
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(@PathVariable Long reviewId,
                                          @Valid @RequestBody ReviewRequest reviewRequest,
                                          HttpServletRequest request) {
        try {
            String email = getUserEmailFromSession(request);
            User currentUser = authService.getUserByEmail(email);
            ReviewResponse response = reviewService.updateReview(reviewId, reviewRequest, currentUser);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId,
                                          HttpServletRequest request) {
        try {
            String email = getUserEmailFromSession(request);
            User currentUser = authService.getUserByEmail(email);
            reviewService.deleteReview(reviewId, currentUser);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(e.getMessage());
        }
    }
}