package com.ada.ratemycourse.dto;

import lombok.Data;

@Data
public class CourseResponse {
    private Long id;
    private String code;
    private String title;
    private String school;
    private String department;
    private String professorName;
    private Long professorId;
    private Double averageRating;
    private Integer reviewCount;
    private String difficulty;
}