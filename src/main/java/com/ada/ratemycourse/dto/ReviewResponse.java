package com.ada.ratemycourse.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReviewResponse {
    private Long id;
    private Double rating;
    private String difficulty;
    private String text;
    private String semester;
    private Integer year;
    private LocalDateTime createdAt;
    private String courseCode;
    private String courseTitle;
    private String professorName;
    private boolean canEdit; // true if current user is the author
}